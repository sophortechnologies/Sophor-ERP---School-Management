import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserStatus } from '../../../common/enums/user-status.enum';

/**
 * JWT Authentication Strategy
 * Validates JWT token and extracts user payload
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Validate JWT payload
   * Called automatically when JWT is verified
   * @param payload - Decoded JWT payload
   */
  async validate(payload: any) {
    // Find user by ID from JWT payload
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['role'],
    });

    // Check if user exists
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      throw new UnauthorizedException(
        `Account is locked. Try again in ${user.getRemainingLockTime()} minutes`,
      );
    }

    // Return user object that will be attached to request
    return {
      id: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    };
  }
}