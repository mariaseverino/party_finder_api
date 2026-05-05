import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RpgGroupService } from './rpg-group.service';
import { RPG_GROUP_REPOSITORY } from '../infrastructure/rpg-group.tokens';
import { CreateRpgGroupRequestBodyDto } from '../dto/create-rpg-group.dto';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import { RpgGroupRepository } from 'rpg-group/entities/rpg-group.repository';
import { UserRepository } from 'user/domain/user.repository';
import { User } from 'user/domain/user.entity';
import { RPGGroup } from 'rpg-group/entities/rpg-group.entity';

const mockRpgGroupRepository = {
  findByName: jest.fn(),
  create: jest.fn(),
  saveTags: jest.fn(),
  findAll: jest.fn(),
  findAllByMaster: jest.fn(),
};

const mockUserRepository = {
  saveInterests: jest.fn(),
  findExistingTags: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

describe('RpgGroupService', () => {
  let rpgGroupService: RpgGroupService;
  let rpgGroupRepository: RpgGroupRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RpgGroupService,
        {
          provide: RPG_GROUP_REPOSITORY,
          useValue: mockRpgGroupRepository,
        },
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    rpgGroupService = module.get<RpgGroupService>(RpgGroupService);
    rpgGroupRepository = module.get<RpgGroupRepository>(RPG_GROUP_REPOSITORY);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw if rpg group already exists', async () => {
      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: 'master-123',
        tags: ['1', '2'],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      mockRpgGroupRepository.findByName.mockResolvedValue(dto);

      await expect(rpgGroupService.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(rpgGroupRepository.findByName).toHaveBeenCalledWith(dto.name);
    });

    it('should throw if rpg group master do not exists', async () => {
      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: 'master-123',
        tags: ['1', '2'],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      mockRpgGroupRepository.findByName.mockResolvedValue(undefined);
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(rpgGroupService.create(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(rpgGroupRepository.findByName).toHaveBeenCalledWith(dto.name);
      expect(userRepository.findById).toHaveBeenCalledWith(dto.masterId);
    });

    it('should create a rpg group with no tags', async () => {
      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: 'master-123',
        tags: [],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      mockRpgGroupRepository.findByName.mockResolvedValue(undefined);
      mockUserRepository.findById.mockResolvedValue({} as User);
      mockRpgGroupRepository.create.mockResolvedValue({ id: 'group-1' });

      await rpgGroupService.create(dto);

      expect(rpgGroupRepository.saveTags).not.toHaveBeenCalled();
    });

    it('should create a rpg group with with tags', async () => {
      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: 'master-123',
        tags: ['1', '2'],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      mockRpgGroupRepository.findByName.mockResolvedValue(undefined);
      mockUserRepository.findById.mockResolvedValue({} as User);
      mockRpgGroupRepository.create.mockResolvedValue({ id: 'group-1' });

      await rpgGroupService.create(dto);

      expect(rpgGroupRepository.saveTags).toHaveBeenCalledWith(
        'group-1',
        dto.tags,
      );
    });
  });
});
