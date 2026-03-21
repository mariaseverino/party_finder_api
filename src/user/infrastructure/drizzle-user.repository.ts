import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { db } from 'src/db/client';
import { users } from 'src/db/schema/user';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { tags, userInterests } from 'src/db/schema/rpg-group';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
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

  async saveInterests(userId: string, tags: string[]) {
    await db.insert(userInterests).values(
      tags.map((tagId) => ({
        userId,
        tagId,
      })),
    );
  }

  async findExistingTags(tagIds: string[]) {
    const result = await db
      .select({ id: tags.id })
      .from(tags)
      .where(inArray(tags.id, tagIds));

    return result.map((t) => t.id); // retorna só os ids existentes
  }
}
