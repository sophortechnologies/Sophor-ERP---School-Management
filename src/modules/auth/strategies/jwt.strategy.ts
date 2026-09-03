import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  // ✅ FIX: Inject PrismaService here
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,   
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Reject deactivated users on every request — not just at login
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return {
      id: user.id,
      sub: user.id,
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      roleCode: user.role?.code,
      roleId: user.roleId,
      permissions: payload.permissions || [],
    };
  }
}