import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/sign-up.dto';
import { randomUUID } from 'crypto';
import { AuthRepository } from '../domain/auth.repository';

interface CreatedUserDto {
  id: string;
  nickname: string;
  email: string;
  password: string;
}
@Injectable()
export class InMemoryAuthRepository implements AuthRepository {
  private users: CreatedUserDto[] = [];

  constructor() {}
  async create(data: CreateUserDto) {
    const newUser = {
      ...data,
      id: randomUUID(),
    };
    this.users.push(newUser);
    return this.users[0];
  }

  async findById(id: string) {
    return this.users.find((item) => item.id === id);
  }

  async findByEmail(email: string) {
    return this.users.find((item) => item.email === email);
  }
}
