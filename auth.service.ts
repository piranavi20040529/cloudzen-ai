import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../users/entities/user.entity.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private resetTokensRepository: Repository<PasswordResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { fullName, email, password } = registerDto;

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      fullName,
      email,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);

    // Generate JWT
    const token = this.generateToken(savedUser);

    // Return user without password
    const { password: _, ...userProfile } = savedUser;
    return { token, user: userProfile };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with password field included
    const user = await this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        password: true,
        language: true,
        userType: true,
        healthAlerts: true,
        voiceAlertsEnabled: true,
        locationPermissionGranted: true,
        city: true,
        district: true,
        province: true,
        country: true,
        lastLatitude: true,
        lastLongitude: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT
    const token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userProfile } = user;
    return { token, user: userProfile };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists — always return success message
      return { message: 'If the email exists, a 6-digit verification code has been sent.' };
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    // Delete any existing tokens for this user
    await this.resetTokensRepository.delete({ userId: user.id });

    // Save new OTP token (expires in 10 minutes)
    const resetToken = this.resetTokensRepository.create({
      userId: user.id,
      email: user.email,
      token: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      verified: false,
    });
    await this.resetTokensRepository.save(resetToken);

    // Send email with OTP code
    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      otpCode,
    );

    return { message: 'If the email exists, a 6-digit verification code has been sent.' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    // Find active un-expired reset tokens for this email
    const tokens = await this.resetTokensRepository.find({
      where: {
        email,
        expiresAt: MoreThan(new Date()),
      },
    });

    let matchedToken: PasswordResetToken | null = null;
    for (const t of tokens) {
      const isMatch = await bcrypt.compare(otp, t.token);
      if (isMatch) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired 6-digit verification code');
    }

    // Mark as verified
    matchedToken.verified = true;
    await this.resetTokensRepository.save(matchedToken);

    return {
      valid: true,
      resetToken: matchedToken.id,
      message: 'Verification code confirmed successfully',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    // Find token by ID
    const tokenRecord = await this.resetTokensRepository.findOne({
      where: { id: resetToken },
    });

    if (!tokenRecord || !tokenRecord.verified || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset session. Please request a new code.');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(tokenRecord.userId, {
      password: hashedPassword,
    });

    // Delete used token
    await this.resetTokensRepository.delete({ userId: tokenRecord.userId });

    return { message: 'Password has been reset successfully' };
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
