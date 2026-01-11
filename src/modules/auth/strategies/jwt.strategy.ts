// // // import { ExtractJwt, Strategy } from 'passport-jwt';
// // // import { PassportStrategy } from '@nestjs/passport';
// // // import { Injectable } from '@nestjs/common';
// // // import { ConfigService } from '@nestjs/config';

// // // @Injectable()
// // // export class JwtStrategy extends PassportStrategy(Strategy) {
// // //   constructor(private configService: ConfigService) {
// // //     super({
// // //       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// // //       ignoreExpiration: false,
// // //       secretOrKey: configService.get<string>('JWT_SECRET') 
// // //                     || 'fallback-secret-key-minimum-32-characters-long',
// // //     });
// // //   }

// // //   async validate(payload: any) {
// // //     return { 
// // //       id: payload.sub,        // FIX: return id instead of userId
// // //       email: payload.email,
// // //       role: payload.role,
// // //       roleId: payload.roleId
// // //     };
// // //   }
// // // }


// // import { ExtractJwt, Strategy } from 'passport-jwt';
// // import { PassportStrategy } from '@nestjs/passport';
// // import { Injectable, UnauthorizedException } from '@nestjs/common';
// // import { ConfigService } from '@nestjs/config';
// // import { PrismaService } from '../../../database/prisma.service'; // Add this import

// // @Injectable()
// // export class JwtStrategy extends PassportStrategy(Strategy) {
// //   constructor(
// //     private configService: ConfigService,
// //     private prisma: PrismaService, // Add PrismaService
// //   ) {
// //     super({
// //       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// //       ignoreExpiration: false,
// //       secretOrKey: configService.get<string>('JWT_SECRET') 
// //                     || 'fallback-secret-key-minimum-32-characters-long',
// //     });
// //   }

// //   async validate(payload: any) {
// //     // Optional: Verify user still exists and is active
// //     const user = await this.prisma.user.findUnique({
// //       where: { id: payload.sub },
// //       include: { role: true },
// //     });

// //     if (!user || !user.isActive) {
// //       throw new UnauthorizedException('User not found or inactive');
// //     }

// //     return { 
// //       id: payload.sub,
// //       email: payload.email,
// //       username: payload.username,
// //       role: payload.role, // This should now be the CODE (e.g., "SUPER_ADMIN")
// //       roleId: payload.roleId,
// //       roleName: payload.roleName, // Optional
// //     };
// //   }
// // }

// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private configService: ConfigService,
//     private authService: AuthService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET') || 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
//     });
//   }

//   async validate(payload: any) {
//     const user = await this.authService.validateUserById(payload.sub);
    
//     if (!user) {
//       throw new UnauthorizedException('User not found');
//     }

//     return {
//       id: user.id,
//       sub: user.id,
//       email: user.email,
//       username: user.username,
//       role: user.role?.code || 'STUDENT',
//       roleId: user.roleId,
//       permissions: user.permissions,
//     };
//   }
// }

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