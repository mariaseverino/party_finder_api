import { Injectable } from '@nestjs/common';
import { RpgGroupRepository } from '../entities/rpg-group.repository';
import { CreateRpgGroupDto } from '../dto/create-rpg-group.dto';
import { and, eq } from 'drizzle-orm';
import { db } from 'db/client';
import { rpgGroups, rpgGroupTags, rpgMembers } from 'db/schema/rpg-group';
import { tags } from 'db/schema/tag';
import { RPGGroup } from 'rpg-group/entities/rpg-group.entity';
import { GroupMembershipDto } from 'rpg-group/dto/rpg-group-membership.dto';

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

  async changeTotalPlayers(rpgGroupId: string, players: number) {
    await db
      .update(rpgGroups)
      .set({ currentPlayers: players })
      .where(eq(rpgGroups.id, rpgGroupId));
  }

  async joinMemberToRpgGroup({ memberId, rpgGroupId }: GroupMembershipDto) {
    await db.insert(rpgMembers).values({ memberId, rpgGroupId }).returning();
  }

  async leaveMemberToRpgGroup({ memberId, rpgGroupId }: GroupMembershipDto) {
    await db
      .delete(rpgMembers)
      .where(
        and(
          eq(rpgMembers.rpgGroupId, rpgGroupId),
          eq(rpgMembers.memberId, memberId),
        ),
      );
  }
}
