// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Service encapsulating authentication logic
@Injectable()
export class AuthService {
  // Inject user data access and JWT signing service
  constructor(
    private users: UserService,
    private jwt: JwtService,
  ) {}

  // Register a new user via UserService
  register(name: string, email: string, password: string) {
    return this.users.create({ name, email, password });
  }

  // Verify email/password and return a safe user object on success
  async validateUser(email: string, pass: string) {
    // Use method that selects +password for comparison
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) return null;

    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;

    const { password, ...safe } = user.toObject();
    return safe;
  }

  // Produce signed JWT access token with subject and email
  async login(user: { _id: any; email: string }) {
    const payload = { sub: user._id.toString(), email: user.email };
    return { access_token: await this.jwt.signAsync(payload) };
  }
}
