import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db/client';
import { users } from 'src/db/schema/user';
import { CreateUserDto } from '../dto/sign-up.dto';
import { AuthRepository } from '../domain/auth.repository';

@Injectable()
export class AuthRepositoryDrizzle implements AuthRepository {
  async create(data: CreateUserDto) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
  }
}
