import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY } from 'src/user/infrastructure/user.tokens';
import { type UserRepository } from 'src/user/domain/user.repository';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    saveInterests: jest.fn(),
    findExistingTags: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockUser = () => ({
    id: '1',
    nickname: 'John Doe',
    email: 'john@email.com',
    password: '123456',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveInterests', () => {
    it('should throw if user not exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.saveInterests('', [])).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith('');
    });

    it('should throw if has invalid tags', async () => {
      const user = mockUser();

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockUserRepository.findExistingTags.mockResolvedValue([]);

      await expect(
        userService.saveInterests(user.email, ['tag-invalida']),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(userRepository.findExistingTags).toHaveBeenCalledWith([
        'tag-invalida',
      ]);
    });

    it('should save user´s interests', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser());

      const user = mockUser();

      mockUserRepository.findExistingTags.mockResolvedValue(['']);

      mockUserRepository.saveInterests.mockResolvedValue(undefined);

      await userService.saveInterests(user.email, ['']);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
      expect(userRepository.findExistingTags).toHaveBeenCalledWith(['']);
      expect(userRepository.saveInterests).toHaveBeenCalledWith(user.id, ['']);
    });
  });

  describe('findOne', () => {
    it('should throw if user not exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.findOne('')).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith('');
    });

    it('should return if user it exists', async () => {
      const user = mockUser();

      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await userService.findOne(user.email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
      expect(result).toEqual(user);
    });
  });
});
