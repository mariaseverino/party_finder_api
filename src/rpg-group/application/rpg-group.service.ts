import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRpgGroupRequestBodyDto } from '../dto/create-rpg-group.dto';
import { RPG_GROUP_REPOSITORY } from '../infrastructure/rpg-group.tokens';
import { type RpgGroupRepository } from '../entities/rpg-group.repository';
import { type UserRepository } from 'user/domain/user.repository';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';

@Injectable()
export class RpgGroupService {
  constructor(
    @Inject(RPG_GROUP_REPOSITORY)
    private readonly rpgGroupRepository: RpgGroupRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async create(data: CreateRpgGroupRequestBodyDto) {
    const rpgGroupAlreadyExists = await this.rpgGroupRepository.findByName(
      data.name,
    );

    if (rpgGroupAlreadyExists) {
      throw new BadRequestException();
    }

    const masterExists = await this.userRepository.findById(data.masterId);

    if (!masterExists) {
      throw new NotFoundException();
    }

    const { tags, ...rpgGroupDto } = data;

    const rpgGroup = await this.rpgGroupRepository.create(rpgGroupDto);

    if (tags && tags.length > 0) {
      await this.rpgGroupRepository.saveTags(rpgGroup.id, tags);
    }
  }

  async getAll() {
    return await this.rpgGroupRepository.findAll();
  }

  async getAllRpgGroupByMasterId(masterId: string) {
    return await this.rpgGroupRepository.findAllByMaster(masterId);
  }
}
