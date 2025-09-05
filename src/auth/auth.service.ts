// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
  ) {}

  register(name: string, email: string, password: string) {
    return this.users.create({ name, email, password });
  }

  async validateUser(email: string, password: string) {
    const query = await this.users.findByEmailWithPassword(email);
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...safe } = user.toObject();
    return safe;
  }

  async login(user: { _id: any; email: string }) {
    const payload = { sub: user._id.toString(), email: user.email };
    return { access_token: await this.jwt.signAsync(payload) };
  }
}
