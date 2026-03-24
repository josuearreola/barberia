import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SecuritySessionsService } from '../security-sessions.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly securitySessionsService: SecuritySessionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.session?.userId as number | undefined;
    if (!userId) {
      return false;
    }

    const loginAt = request.session?.loginAt as number | undefined;
    return !this.securitySessionsService.isSessionRevoked(userId, loginAt);
  }
}
