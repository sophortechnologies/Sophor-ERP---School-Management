// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
    });
  }

  async validate(payload: any) {
    // Log the payload to debug
    console.log('JWT Payload:', payload);
    
    return {
      id: payload.sub,
      sub: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role, // This should be the CODE like "SUPER_ADMIN"
      roleId: payload.roleId,
      permissions: payload.permissions || [],
    };
  }
}