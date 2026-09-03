import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Email')
@ApiBearerAuth()
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test/welcome')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async testWelcomeEmail(@Body() body: { to: string; studentId: string; name: string }) {
    await this.emailService.sendWelcomeEmail({
      to: body.to,
      studentId: body.studentId || 'TEST001',
      tempPassword: 'Temp@123456',
      name: body.name || 'Test Student',
    });
    return { message: 'Welcome email sent successfully' };
  }

  @Post('test/payslip')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async testPayslipEmail(@Body() body: { to: string; name: string; amount: number }) {
    await this.emailService.sendPayslipEmail(
      body.to,
      body.name || 'Test Employee',
      body.amount || 50000,
      'https://yourdomain.com/payslip/test.pdf',
    );
    return { message: 'Payslip email sent successfully' };
  }

  @Post('test/activation')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async testActivationEmail(@Body() body: { to: string; studentId: string }) {
    await this.emailService.sendActivationConfirmation({
      to: body.to,
      studentId: body.studentId || 'TEST001',
    });
    return { message: 'Activation email sent successfully' };
  }
}