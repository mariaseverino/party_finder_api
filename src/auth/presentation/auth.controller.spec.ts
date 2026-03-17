import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { SignUpRequestBodyDto } from '../dto/sign-up.dto';
import { SignInRequestBodyDto } from '../dto/sign-in.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn();
    return res as Response;
  };

  const mockToken = () => ({
    access_token: 'jwt_token',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

    it('should call authService.signUp with dto', async () => {
      mockAuthService.signUp.mockResolvedValue(mockToken());

      const res = mockResponse();

      await controller.signUp(dto, res);

      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });

    it('should set jwt cookie', async () => {
      mockAuthService.signUp.mockResolvedValue(mockToken());

      const res = mockResponse();

      await controller.signUp(dto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
    });

    it('should return success message', async () => {
      mockAuthService.signUp.mockResolvedValue(mockToken());

      const res = mockResponse();

      const result = await controller.signUp(dto, res);

      expect(result).toEqual({
        message: 'User created',
      });
    });

    it('should propagate errors from service', async () => {
      const res = mockResponse();

      mockAuthService.signUp.mockRejectedValue(new Error('Service error'));

      await expect(controller.signUp(dto, res)).rejects.toThrow(
        'Service error',
      );

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    const dto: SignInRequestBodyDto = {
      email: 'john@email.com',
      password: '123456',
    };

    it('should call authService.signIn with dto', async () => {
      mockAuthService.signIn.mockResolvedValue(mockToken());

      const res = mockResponse();

      await controller.signIn(dto, res);

      expect(authService.signIn).toHaveBeenCalledWith(dto);
    });

    it('should set jwt cookie', async () => {
      mockAuthService.signIn.mockResolvedValue(mockToken());

      const res = mockResponse();

      await controller.signIn(dto, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
    });

    it('should return success message', async () => {
      mockAuthService.signIn.mockResolvedValue(mockToken());

      const res = mockResponse();

      const result = await controller.signIn(dto, res);

      expect(result).toEqual({
        message: 'User logged',
      });
    });

    it('should propagate errors from service', async () => {
      const res = mockResponse();

      mockAuthService.signIn.mockRejectedValue(new Error('Service error'));

      await expect(controller.signIn(dto, res)).rejects.toThrow(
        'Service error',
      );

      expect(res.cookie).not.toHaveBeenCalled();
    });
  });
});
