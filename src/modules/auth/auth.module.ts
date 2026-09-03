// src/modules/auth/auth.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
@Global()
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
        signOptions: {
          expiresIn: '24h',
        },
      }),
      inject: [ConfigService],
    }),
    
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PermissionService,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    PermissionService,
    JwtModule, // This exports JwtService

  ],
})
export class AuthModule {}