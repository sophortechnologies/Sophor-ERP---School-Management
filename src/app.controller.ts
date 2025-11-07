// // import { Controller, Get } from '@nestjs/common'; 
// // import { ApiTags, ApiOperation } from '@nestjs/swagger'; 
// // import { AppService } from './app.service'; 
// // import { Public } from './common/decorators/public.decorator'; 
// // @ApiTags('Health Check') 
// // @Controller() 
// // export class AppController { 
// // constructor(private readonly appService: AppService) {} 
// // @Public() 
// // @Get() 
// // @ApiOperation({ summary: 'Health check endpoint' }) 
// // getHealth() { 
// // return this.appService.getHealth(); 
// // } 
// // } 

// import { Controller, Get } from '@nestjs/common';

// @Controller()
// export class AppController {
//   @Get()
//   getRoot() {
//     return {
//     //   success: true,
//       message: '🚀 School ERP Backend is running successfully!',
//       timestamp: new Date().toISOString(),
//     };
//   }
// }


import { Controller, Get } from '@nestjs/common';

@Controller() // 👈 remove 'api/v1' here
export class AppController {
  @Get()
  getRoot() {
    return {
      success: true,
      message: '🚀 School ERP Backend is running successfully!',
      timestamp: new Date().toISOString(),
    };
  }
}
