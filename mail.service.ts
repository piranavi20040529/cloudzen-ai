import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    otpCode: string,
  ): Promise<void> {
    try {
      const smtpUser = this.configService.get<string>('SMTP_USER');

      if (!smtpUser) {
        this.logger.warn(
          'SMTP not configured. OTP code for dev: ' + otpCode,
        );
        return;
      }

      await this.transporter.sendMail({
        from: `"CloudZen AI" <${smtpUser}>`,
        to,
        subject: 'CloudZen AI — Your Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0F172A; color: #F8FAFC; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #00E5FF; margin: 0;">CloudZen AI</h2>
              <p style="color: #94A3B8; font-size: 13px; margin-top: 4px;">Weather Intelligence & Safety Advisor</p>
            </div>
            <p style="color: #F8FAFC; font-size: 16px;">Hello ${userName || 'User'},</p>
            <p style="color: #CBD5E1; line-height: 22px;">We received a request to reset your password. Please use the 6-digit verification code below:</p>
            <div style="background: #1E293B; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0; border: 1px solid #334155;">
              <span style="font-size: 36px; font-weight: 800; color: #00E5FF; letter-spacing: 8px; font-family: monospace;">${otpCode}</span>
            </div>
            <p style="color: #F59E0B; font-size: 13px; text-align: center;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #94A3B8; font-size: 13px; margin-top: 20px;">If you did not request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
            <p style="color: #64748B; font-size: 11px; text-align: center;">CloudZen AI — Sri Lanka 🇱🇰</p>
          </div>
        `,
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send reset email to ${to}`, error);
      // Don't throw — we don't want to reveal email existence
    }
  }
}
