import { 
Injectable, 
UnauthorizedException, 
BadRequestException, 
ConflictException, 
Logger, 
} from '@nestjs/common'; 
import { JwtService } from '@nestjs/jwt'; 
import { ConfigService } from '@nestjs/config'; 
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository } from 'typeorm'; 
import { User } from './entities/user.entity'; 
import { Role } from './entities/role.entity'; 
import { LoginDto } from './dto/login.dto'; 
import { RegisterDto } from './dto/register.dto'; 
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto'; 
import { UserStatus } from '../../common/enums/user-status.enum'; 
import { RESPONSE_MESSAGES } from '../../common/constants/response-messages.constant'; 
/** 
* Authentication Service 
* Handles all authentication logic: login, register, JWT generation 
*/ 
@Injectable() 
export class AuthService { 
private readonly logger = new Logger(AuthService.name); 
private readonly MAX_LOGIN_ATTEMPTS = 5; 
private readonly LOCKOUT_DURATION_MINUTES = 15; 
constructor(
    @InjectRepository(User) 
    private usersRepository: Repository<User>, 
    @InjectRepository(Role) 
    private rolesRepository: Repository<Role>, 
    private jwtService: JwtService, 
    private configService: ConfigService, 
  ) {} 
 
  /** 
   * Validate user credentials 
   * Used by LocalStrategy for email/password authentication 
   */ 
  async validateUser(email: string, password: string): Promise<User | null> { 
    this.logger.log(`Validating credentials for user: ${email}`); 
 
    const user = await this.usersRepository.findOne({ 
      where: { email }, 
      relations: ['role'], 
    }); 
 
    if (!user) { 
      this.logger.warn(`User not found: ${email}`); 
      return null; 
    } 
 
    // Check account status 
    if (user.status !== UserStatus.ACTIVE) { 
      throw new UnauthorizedException('Account is not active'); 
    } 
 
    // Check if account is locked 
    if (user.isAccountLocked()) { 
      const remainingTime = user.getRemainingLockTime(); 
      throw new UnauthorizedException( 
        `Account is locked due to multiple failed login attempts. Try again in ${remainingTime} 
minutes`, 
      ); 
    } 
 
    // Validate password 
    const isPasswordValid = await user.validatePassword(password); 
 
    if (!isPasswordValid) { 
      await this.handleFailedLogin(user); 
      this.logger.warn(`Invalid password for user: ${email}`); 
      return null; 
    } 
 
    // Reset failed attempts on successful validation 
    await this.resetFailedAttempts(user); 
 
    this.logger.log(`User validated successfully: ${email}`); 
    return user; 
  } 
 
  /** 
   * User login 
   * Generates JWT tokens and updates last login timestamp 
   */ 
  async login(user: User): Promise<AuthResponseDto> { 
    this.logger.log(`User logging in: ${user.email}`); 
 
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name, 
      permissions: user.role.permissions, 
    }; 
 
    // Generate access token 
    const accessToken = this.jwtService.sign(payload, { 
      secret: this.configService.get('JWT_SECRET'), 
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'), 
    }); 
 
    // Generate refresh token 
    const refreshToken = this.jwtService.sign( 
      { sub: user.id }, 
      { 
        secret: this.configService.get('JWT_REFRESH_SECRET'), 
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'), 
      }, 
    ); 
 
    // Update last login timestamp 
    await this.usersRepository.update(user.id, { 
      lastLoginAt: new Date(), 
    }); 
 
    this.logger.log(`Login successful for user: ${user.email}`); 
 
    return { 
      accessToken, 
      refreshToken, 
      user: this.formatUserResponse(user), 
    }; 
  } 
 
  /** 
   * User registration 
   * Creates new user with specified role 
   */ 
  async register(registerDto: RegisterDto): Promise<User> { 
    this.logger.log(`Registering new user: ${registerDto.email}`); 
 
    // Check if user already exists 
    const existingUser = await this.usersRepository.findOne({ 
      where: [ 
        { email: registerDto.email }, 
        { username: registerDto.username }, 
      ], 
    }); 
 
    if (existingUser) { 
      throw new ConflictException('User with this email or username already exists'); 
    } 
 
    // Verify role exists 
    const role = await this.rolesRepository.findOne({ 
      where: { id: registerDto.roleId, isActive: true }, 
    }); 
 
    if (!role) { 
      throw new BadRequestException('Invalid role specified'); 
    } 
 
    // Create new user 
    const user = this.usersRepository.create({ 
      email: registerDto.email, 
      username: registerDto.username, 
      passwordHash: registerDto.password, // Will be hashed by @BeforeInsert 
      role, 
      status: UserStatus.ACTIVE, 
      isVerified: false, 
    }); 
 
    const savedUser = await this.usersRepository.save(user); 
 
    this.logger.log(`User registered successfully: ${savedUser.email}`); 
 
    return savedUser; 
  } 
 
  /** 
   * Refresh access token 
   * Generates new access token from refresh token 
   */ 
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> { 
    try { 
      const payload = this.jwtService.verify(refreshToken, { 
        secret: this.configService.get('JWT_REFRESH_SECRET'), 
      }); 
 
      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub }, 
        relations: ['role'], 
      }); 
 
      if (!user || user.status !== UserStatus.ACTIVE) { 
        throw new UnauthorizedException('Invalid refresh token'); 
      } 
 
      const newPayload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role.name, 
        permissions: user.role.permissions, 
      }; 
 
      const accessToken = this.jwtService.sign(newPayload, { 
        secret: this.configService.get('JWT_SECRET'), 
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'), 
      }); 
 
      return { accessToken }; 
    } catch (error) { 
      throw new UnauthorizedException('Invalid or expired refresh token'); 
    } 
  } 
 
  /** 
   * Get user profile by ID 
   */ 
  async getProfile(userId: string): Promise<User> { 
    const user = await this.usersRepository.findOne({ 
      where: { id: userId }, 
      relations: ['role'], 
    }); 
 
    if (!user) { 
      throw new UnauthorizedException('User not found'); 
    } 
 
    return user; 
  } 
 
  /** 
   * Handle failed login attempt 
   * Increments failed attempts and locks account if threshold reached 
   */ 
  private async handleFailedLogin(user: User): Promise<void> { 
    const attempts = user.failedLoginAttempts + 1; 
    const updateData: Partial<User> = { failedLoginAttempts: attempts }; 
 
    // Lock account after max attempts 
    if (attempts >= this.MAX_LOGIN_ATTEMPTS) { 
      const lockUntil = new Date(); 
      lockUntil.setMinutes(lockUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES); 
      updateData.lockedUntil = lockUntil; 
 
      this.logger.warn( 
        `Account locked for user: ${user.email} (${attempts} failed attempts)`, 
      ); 
    } 
 
    await this.usersRepository.update(user.id, updateData); 
  } 
 
  /** 
   * Reset failed login attempts 
   */ 
  /**
   * Reset failed login attempts
   */
  private async resetFailedAttempts(user: User): Promise<void> {
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.usersRepository.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null as any, // Type assertion for null
      });
    }
  }
 
  /** 
   * Format user response 
   */ 
  private formatUserResponse(user: User): UserResponseDto { 
    return { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role.name, 
      isVerified: user.isVerified, 
      status: user.status, 
    }; 
  } 
}