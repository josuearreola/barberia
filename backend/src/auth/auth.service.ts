import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const role = adminEmail && adminEmail === dto.email.toLowerCase()
      ? UserRole.Admin
      : UserRole.Cliente;

    return this.usersService.create({
      usuario: dto.usuario,
      telefono: dto.telefono,
      email: dto.email,
      password: dto.password,
      role,
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.validatePassword(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return user;
  }

  async getProfile(userId: number) {
    return this.usersService.findById(userId);
  }
}
