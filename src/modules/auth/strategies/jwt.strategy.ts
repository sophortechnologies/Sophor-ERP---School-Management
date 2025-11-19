// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { AuthService } from '../auth.service';
// import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private configService: ConfigService,
//     private authService: AuthService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get('jwt.secret'),
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.authService.validateUserById(payload.sub);
//     if (!user) {
//       throw new UnauthorizedException('User not found or inactive');
//     }
//     return user;
//   }
// }

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUserById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}