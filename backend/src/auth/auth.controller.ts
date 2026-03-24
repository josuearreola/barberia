import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const user = await this.authService.register(dto);
    req.session.userId = user.id;
    req.session.role = user.role;
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    req.session.userId = user.id;
    req.session.role = user.role;
    return user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    return new Promise<{ ok: boolean }>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new Error('No se pudo cerrar la sesion'));
          return;
        }

        resolve({ ok: true });
      });
    });
  }

  @Get('me')
  async me(@Req() req: Request) {
    const userId = req.session.userId;
    if (!userId) {
      return null;
    }

    try {
      return await this.authService.getProfile(userId);
    } catch {
      return null;
    }
  }
}
