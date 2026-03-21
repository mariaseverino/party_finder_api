import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';

interface CreatedUserDto {
  id: string;
  nickname: string;
  email: string;
  password: string;
}
@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: CreatedUserDto[] = [];
  private usersInterests: string[] = ['1', '2'];

  async findExistingTags(tagIds: string[]): Promise<string[]> {
    return this.usersInterests.filter((i) => tagIds.includes(i));
  }

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

  async saveInterests(userId: string, tags: string[]) {
    this.usersInterests = [...this.usersInterests, ...tags];
  }

  async clear(): Promise<void> {
    this.users = [];
  }
}
