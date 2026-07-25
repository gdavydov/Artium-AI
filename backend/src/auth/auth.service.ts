// src/auth/auth.service.ts
//
// Staff-only login (Design Document: "no public/anonymous accounts").
// Passwords are hashed with bcrypt (User.passwordHash) — never stored or
// compared in plaintext. On success, issues a JWT carrying the user's id,
// email, and Role.name — that's what JwtStrategy/RolesGuard/@CurrentUser
// read on every subsequent request.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string; role: string; email: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      accessToken: this.jwt.sign(payload),
      role: user.role.name,
      email: user.email,
    };
  }
}
