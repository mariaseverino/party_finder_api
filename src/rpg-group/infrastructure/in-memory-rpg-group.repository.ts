import { randomUUID } from 'crypto';
import { CreateRpgGroupDto } from '../dto/create-rpg-group.dto';
import { RPGGroup } from '../entities/rpg-group.entity';
import { RpgGroupRepository } from '../entities/rpg-group.repository';
import { tags } from 'db/schema/tag';

export class InMemoryRpgGroupRepository implements RpgGroupRepository {
  private rpgGroups: RPGGroup[] = [];
  private rpgTags: string[] = ['1', '2'];
  private tags: { name: string; id: string }[] = [];

  async create(data: CreateRpgGroupDto): Promise<RPGGroup> {
    const newRpg = { ...data, id: randomUUID() };
    this.rpgGroups.push(newRpg);
    return this.rpgGroups[0];
  }
  async findByName(name: string): Promise<RPGGroup | undefined> {
    return this.rpgGroups.find((item) => item.name === name);
  }
  async findAll(): Promise<RPGGroup[]> {
    return this.rpgGroups;
  }

  async saveTags(groupId: string, tags: string[]): Promise<void> {
    this.rpgTags = [...this.rpgTags, ...tags];
  }
  async findAllByMaster(masterId: string): Promise<RPGGroup[]> {
    return this.rpgGroups.filter((item) => item.masterId == masterId);
  }

  async createTag(name: string): Promise<void> {
    const newTag = { ...{ name }, id: randomUUID() };
    this.tags.push(newTag);
  }

  async clear(): Promise<void> {
    this.rpgGroups = [];
  }
}
