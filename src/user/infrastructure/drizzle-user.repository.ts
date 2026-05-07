import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { db } from 'db/client';
import { refreshTokens, userInterests, users } from 'db/schema/user';
import { tags } from 'db/schema/tag';

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

    return result.map((t) => t.id);
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    await db
      .insert(refreshTokens)
      .values({ userId, token })
      .onConflictDoUpdate({
        target: refreshTokens.userId,
        set: { token },
      });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async findRefreshToken(userId: string) {
    const [refreshToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId));

    return refreshToken;
  }
}
