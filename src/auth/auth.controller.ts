// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

// Controller handling routes under /auth
@Controller('auth')
export class AuthController {
  // Inject AuthService for auth-related operations
  constructor(private readonly auth: AuthService) {}

  // Registers a new user
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.name, dto.email, dto.password);
  }

  // Logs in a user, issues HttpOnly JWT cookie
  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Req() req: any) {
    const user = await this.auth.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { access_token } = await this.auth.login(user);

    // Set HttpOnly cookie that stores the JWT
    req.res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return { success: true };
  }

  // Clears auth cookie to log out
  @Post('logout')
  logout(@Req() req: any) {
    req.res.clearCookie('access_token', { path: '/' });
    return { success: true };
  }

  // Returns current authenticated user info (requires valid JWT)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user; // { userId, email }
  }
}
