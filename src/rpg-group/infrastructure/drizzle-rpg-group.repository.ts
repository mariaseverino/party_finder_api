import { Injectable } from '@nestjs/common';
import { RpgGroupRepository } from '../entities/rpg-group.repository';
import { CreateRpgGroupDto } from '../dto/create-rpg-group.dto';
import { eq } from 'drizzle-orm';
import { db } from 'db/client';
import { rpgGroups, rpgGroupTags } from 'db/schema/rpg-group';
import { tags } from 'db/schema/tag';
import { RPGGroup } from 'rpg-group/entities/rpg-group.entity';

@Injectable()
export class DrizzleRpgGroupRepository implements RpgGroupRepository {
  async create(data: CreateRpgGroupDto) {
    const [rpgGroup] = await db.insert(rpgGroups).values(data).returning();
    return rpgGroup;
  }
  async findByName(name: string) {
    const [rpgGroup] = await db
      .select()
      .from(rpgGroups)
      .where(eq(rpgGroups.name, name));

    return rpgGroup;
  }

  async findAll() {
    return await db.select().from(rpgGroups);
  }

  async findAllByMaster(masterId: string) {
    return await db
      .select()
      .from(rpgGroups)
      .where(eq(rpgGroups.masterId, masterId));
  }

  async saveTags(groupId: string, tags: string[]) {
    await db.insert(rpgGroupTags).values(
      tags.map((tagId) => ({
        groupId,
        tagId,
      })),
    );
  }

  async createTag(name: string) {
    await db.insert(tags).values({ name });
  }

  async findById(id: string) {
    const [rpgGroup] = await db
      .select()
      .from(rpgGroups)
      .where(eq(rpgGroups.id, id))
      .limit(1);

    return rpgGroup;
  }
}
