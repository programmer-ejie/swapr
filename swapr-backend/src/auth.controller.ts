import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService, type SessionRequest } from './auth.service.js';
import { SessionGuard } from './session.guard.js';
import { credentials, parse } from './validation.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() body: unknown) {
    const data = parse(credentials, body);
    return this.auth.register(data.email, data.password);
  }
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const data = parse(credentials, body);
    return this.auth.login(data.email, data.password, response);
  }
  @Get('me')
  @UseGuards(SessionGuard)
  async me(@Req() request: SessionRequest) {
    return { user: await this.auth.user(request.userId) };
  }
  @Post('logout')
  @HttpCode(200)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.auth.logout(request, response);
  }
}
