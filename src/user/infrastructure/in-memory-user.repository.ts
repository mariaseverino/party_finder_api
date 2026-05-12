import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RefreshToken, UserRepository } from '../domain/user.repository';
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
  private refreshTokens: Map<string, string> = new Map();

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
    this.refreshTokens.clear();
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    this.refreshTokens.set(userId, token);
  }

  async findRefreshToken(userId: string): Promise<RefreshToken | null> {
    const token = this.refreshTokens.get(userId);
    return token ? { userId, token } : null;
  }

  async clearRefreshToken(userId: string): Promise<void> {
    this.refreshTokens.delete(userId);
  }
}
