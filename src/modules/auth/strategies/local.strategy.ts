import { Injectable, UnauthorizedException } from '@nestjs/common'; 
import { PassportStrategy } from '@nestjs/passport'; 
import { Strategy } from 'passport-local'; 
import { AuthService } from '../auth.service'; 
/** 
* Local Authentication Strategy 
* Validates email and password credentials 
*/ 
@Injectable() 
export class LocalStrategy extends PassportStrategy(Strategy, 'local') { 
constructor(private authService: AuthService) { 
super({ 
usernameField: 'email', // Use email instead of username 
passwordField: 'password', 
}); 
} 
/** 
* Validate user credentials 
* Called automatically by Passport 
*/ 
async validate(email: string, password: string): Promise<any> { 
const user = await this.authService.validateUser(email, password); 
if (!user) { 
throw new UnauthorizedException('Invalid email or password'); 
} 
return user; 
} 
} 