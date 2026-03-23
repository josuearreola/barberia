import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [UsersModule],
  providers: [AuthService, SessionAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, SessionAuthGuard, RolesGuard],
})
export class AuthModule {}
