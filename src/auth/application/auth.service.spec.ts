import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignUpRequestBodyDto } from '../dto/sign-up.dto';
import { SignInRequestBodyDto } from '../dto/sign-in.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { UserRepository } from 'user/domain/user.repository';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    saveRefreshToken: jest.fn(),
  };

  const mockUser = () => ({
    nickname: 'John Doe',
    email: 'john@email.com',
    password: 'password_hashed',
  });

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('fake_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);

    (bcrypt.hash as jest.Mock).mockResolvedValue('password_hashed');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const dto: SignUpRequestBodyDto = {
      nickname: 'John Doe',
      email: 'john@email.com',
      password: '123456',
    };

    it('should throw if user already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ email: dto.email });

      await expect(authService.signUp(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should create user and return access token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const user = {
        id: randomUUID(),
        nickname: dto.nickname,
        email: dto.email,
        password: 'password_hashed',
      };

      mockUserRepository.create.mockResolvedValue(user);

      const result = await authService.signUp(dto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(userRepository.create).toHaveBeenCalled();

      // expect(mockUserRepository.generateTokenPair).toHaveBeenCalledWith(
      //   user.id,
      //   user.email,
      // );

      expect(result).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });

  describe('signIn', () => {
    const dto: SignInRequestBodyDto = {
      email: 'john@email.com',
      password: '123456',
    };

    it('should throw if user not exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.signIn(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should throw if user´s password is not correct', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser());

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should sign in user if email and password is correct and return access token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser());

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.signIn(dto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);

      // expect(mockUserRepository.generateTokenPair).toHaveBeenCalledWith(
      //   '',
      //   dto.email,
      // );

      expect(result).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });
});
