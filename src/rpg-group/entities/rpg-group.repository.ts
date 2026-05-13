import { CreateRpgGroupDto } from '../dto/create-rpg-group.dto';
import { RPGGroup } from './rpg-group.entity';

export interface RpgGroupRepository {
  create(data: CreateRpgGroupDto): Promise<RPGGroup>;
  findByName(name: string): Promise<RPGGroup | undefined>;
  findAll(): Promise<RPGGroup[]>;
  saveTags(groupId: string, tags: string[]): Promise<void>;
  createTag(name: string): Promise<void>;
  findAllByMaster(masterId: string): Promise<RPGGroup[]>;
  findById(id: string): Promise<RPGGroup | undefined>;
}
