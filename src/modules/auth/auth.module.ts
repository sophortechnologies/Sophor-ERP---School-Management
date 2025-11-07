import { Module } from '@nestjs/common'; 
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { JwtModule } from '@nestjs/jwt'; 
import { PassportModule } from '@nestjs/passport'; 
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { AuthController } from './auth.controller'; 
import { AuthService } from './auth.service'; 
import { User } from './entities/user.entity'; 
import { Role } from './entities/role.entity'; 
import { JwtStrategy } from './strategies/jwt.strategy'; 
import { LocalStrategy } from './strategies/local.strategy'; 
/** 
* Authentication Module 
* Handles user authentication and authorization 
*  
* Features: 
* - JWT-based authentication 
* - Role-based access control (RBAC) 
* - Account lockout after failed attempts 
* - Password hashing with bcrypt 
 * - Refresh token support 
 */ 
@Module({ 
  imports: [ 
    // Register entities for TypeORM 
    TypeOrmModule.forFeature([User, Role]), 
 
    // Passport configuration 
    PassportModule.register({  
      defaultStrategy: 'jwt', 
      session: false, // Stateless JWT authentication 
    }), 
 
    // JWT Module configuration 
    JwtModule.registerAsync({ 
      imports: [ConfigModule], 
      inject: [ConfigService], 
     useFactory: async (configService: ConfigService) => ({
  secret: configService.get<string>('JWT_SECRET'),
  signOptions: { expiresIn: parseInt(configService.get<string>('JWT_EXPIRES_IN') || '3600', 10) },
}),

    }), 
  ], 
  controllers: [AuthController], 
providers: [ 
AuthService, 
JwtStrategy, 
LocalStrategy, 
], 
exports: [AuthService, JwtModule], // Export for use in other modules 
}) 
export class AuthModule {}