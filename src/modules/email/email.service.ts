import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      this.logger.warn('⚠️ SMTP credentials not configured. Emails will be logged only.');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(` [MOCK] Email would be sent to ${to}: ${subject}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        to,
        subject,
        html,
        from: process.env.SMTP_FROM || `"School ERP" <${process.env.SMTP_USER}>`,
      });
      this.logger.log(` Email sent to ${to}: ${subject}`);
      return true;
    } catch (error:any) {
      this.logger.error(` Failed to send email to ${to}: ${error.message}`);
      return false;
    }
  }

  async sendWelcomeEmail(data: { to: string; studentId: string; tempPassword: string; name: string }) {
    const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate?studentId=${data.studentId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2F4F4F;">Welcome to School ERP, ${data.name}!</h2>
        <p>Your student account has been created successfully.</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Student ID</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.studentId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Temporary Password</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${data.tempPassword}</td>
          </tr>
        </table>
        <p>
          <a href="${activationLink}"
             style="background-color: #2F4F4F; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Activate Account
          </a>
        </p>
        <p style="color: #888; font-size: 12px;">
          Please change your password after your first login. If you did not expect
          this email, contact the school administration.
        </p>
      </div>
    `;

    return this.sendEmail(data.to, 'Welcome to School ERP — Account Created', html);
  }

  async sendActivationConfirmation(data: { to: string; studentId: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2F4F4F;">Account Activated Successfully</h2>
        <p>Your student account <strong>${data.studentId}</strong> has been activated.</p>
        <p>Login URL: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
        <hr>
        <p style="font-size: 12px; color: #666;">If you did not request this, please contact the school administration.</p>
      </div>
    `;
    
    return this.sendEmail(data.to, 'Account Activated - School ERP', html);
  }

  async sendPayslipEmail(to: string, employeeName: string, amount: number, payslipUrl: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2F4F4F;">Payslip Generated</h2>
        <p>Dear ${employeeName},</p>
        <p>Your payslip for this month has been generated.</p>
        <p><strong>Net Amount:</strong> ${amount.toFixed(2)} ETB</p>
        <p><a href="${payslipUrl}" style="background-color: #2F4F4F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Payslip</a></p>
        <hr>
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply.</p>
      </div>
    `;
    
    return this.sendEmail(to, 'Payslip Generated', html);
  }

  async sendTestScheduleEmail(data: { to: string; studentId: string; testDate: Date; testType: string; name: string }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2F4F4F;">Admission Test Scheduled</h2>
        <p>Dear ${data.name},</p>
        <p>Your admission test has been scheduled:</p>
        <ul>
          <li><strong>Test Type:</strong> ${data.testType}</li>
          <li><strong>Date:</strong> ${new Date(data.testDate).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(data.testDate).toLocaleTimeString()}</li>
        </ul>
        <p>Please bring your student ID and arrive 30 minutes before the scheduled time.</p>
        <p>Student ID: <strong>${data.studentId}</strong></p>
      </div>
    `;
    
    return this.sendEmail(data.to, 'Admission Test Scheduled', html);
  }

  async sendAdmissionDecisionEmail(data: { to: string; studentId: string; name: string; decision: string; remarks?: string }) {
    const isApproved = data.decision === 'APPROVED';
    const subject = `Admission ${isApproved ? 'Approved' : 'Update'}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: ${isApproved ? '#2F4F4F' : '#cc0000'};">Admission ${isApproved ? 'Approved' : 'Status Update'}</h2>
        <p>Dear ${data.name},</p>
        <p>Your admission application has been <strong>${data.decision}</strong>.</p>
        ${data.remarks ? `<p><strong>Remarks:</strong> ${data.remarks}</p>` : ''}
        <p>Student ID: <strong>${data.studentId}</strong></p>
        ${isApproved ? '<p>Please proceed with fee payment to complete enrollment.</p>' : ''}
      </div>
    `;
    
    return this.sendEmail(data.to, subject, html);
  }
}