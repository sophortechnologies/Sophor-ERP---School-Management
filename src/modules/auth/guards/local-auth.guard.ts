import { Injectable } from '@nestjs/common'; 
import { AuthGuard } from '@nestjs/passport'; 
/** 
* Local Authentication Guard 
* Used in login endpoint to validate email/password 
*/ 
@Injectable() 
export class LocalAuthGuard extends AuthGuard('local') {} 