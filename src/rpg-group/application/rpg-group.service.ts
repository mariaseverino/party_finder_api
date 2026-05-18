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
import { GroupMembershipDto } from 'rpg-group/dto/rpg-group-membership.dto';

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

  async getRpgGroupById(id: string) {
    const rpgGroupExists = await this.rpgGroupRepository.findById(id);

    if (!rpgGroupExists) {
      throw new NotFoundException();
    }

    return rpgGroupExists;
  }

  async addMemberToRpgGroup({ memberId, rpgGroupId }: GroupMembershipDto) {
    const rpgGroupExists = await this.rpgGroupRepository.findById(rpgGroupId);

    if (!rpgGroupExists) {
      throw new NotFoundException();
    }

    if (rpgGroupExists.currentPlayers == rpgGroupExists.maxPlayers) {
      throw new BadRequestException();
    }

    await this.rpgGroupRepository.joinMemberToRpgGroup({
      rpgGroupId,
      memberId,
    });

    await this.rpgGroupRepository.changeTotalPlayers(
      rpgGroupId,
      rpgGroupExists.currentPlayers + 1,
    );
  }

  async removeMemberToRpgGroup({ memberId, rpgGroupId }: GroupMembershipDto) {
    const rpgGroupExists = await this.rpgGroupRepository.findById(rpgGroupId);

    if (!rpgGroupExists) {
      throw new NotFoundException();
    }

    if (rpgGroupExists.currentPlayers === 0) {
      throw new BadRequestException();
    }

    await this.rpgGroupRepository.leaveMemberToRpgGroup({
      rpgGroupId,
      memberId,
    });

    await this.rpgGroupRepository.changeTotalPlayers(
      rpgGroupId,
      rpgGroupExists.currentPlayers - 1,
    );
  }
}
