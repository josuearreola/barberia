import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';

export interface CreateUserData {
  usuario: string;
  telefono: string;
  email: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const existingEmail = await this.usersRepository.findOne({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya esta registrado');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { usuario: data.usuario },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya esta registrado');
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS ?? 10);
    const safeRounds = Number.isFinite(saltRounds) && saltRounds >= 8 ? saltRounds : 10;
    const passwordHash = await bcrypt.hash(data.password, safeRounds);
    const user = this.usersRepository.create({
      usuario: data.usuario,
      telefono: data.telefono,
      email: data.email,
      passwordHash,
      role: data.role ?? UserRole.Cliente,
    });

    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return null;
    }

    return this.sanitize(user);
  }

  sanitize(user: User): User {
    const { passwordHash, ...safeUser } = user as User & { passwordHash?: string };
    return safeUser as User;
  }
}
