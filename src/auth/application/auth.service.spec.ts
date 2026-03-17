import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignUpRequestBodyDto } from '../dto/sign-up.dto';
import { SignInRequestBodyDto } from '../dto/sign-in.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { AuthRepository } from '../domain/auth.repository';
import { AUTH_REPOSITORY } from '../infrastructure/auth.tokens';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: AuthRepository;

  const mockAuthRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockUser = () => ({
    nickname: 'maria',
    email: 'maria@email.com',
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
          provide: AUTH_REPOSITORY,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AUTH_REPOSITORY);

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
      mockAuthRepository.findByEmail.mockResolvedValue({ email: dto.email });

      await expect(authService.signUp(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should create user and return access token', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      const user = {
        id: randomUUID(),
        nickname: dto.nickname,
        email: dto.email,
        password: 'password_hashed',
      };

      mockAuthRepository.create.mockResolvedValue(user);

      const result = await authService.signUp(dto);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

      expect(authRepository.create).toHaveBeenCalled();

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });

      expect(result).toEqual({
        access_token: 'fake_token',
      });
    });
  });

  describe('signIn', () => {
    const dto: SignInRequestBodyDto = {
      email: 'john@email.com',
      password: '123456',
    };

    it('should throw if user not exists', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.signIn(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should throw if user´s password is not correct', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser());

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('should sign in user if email and password is correct and return access token', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser());

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.signIn(dto);

      expect(authRepository.findByEmail).toHaveBeenCalledWith(dto.email);

      expect(result).toHaveProperty('access_token');

      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });
  });
});
