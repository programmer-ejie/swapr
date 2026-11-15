import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService, type SessionRequest } from './auth.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    request.userId = await this.auth.authenticate(request);
    return true;
  }
}
