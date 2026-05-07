import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpRequestBodyDto } from '../dto/sign-up.dto';
import { SignInRequestBodyDto } from '../dto/sign-in.dto';
import { type UserRepository } from 'user/domain/user.repository';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(data: SignUpRequestBodyDto) {
    const userAlreadyExists = await this.userRepository.findByEmail(data.email);

    if (userAlreadyExists) {
      throw new BadRequestException();
    }

    const hash = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      ...data,
      password: hash,
    });

    return await this.generateTokenPair(user.id, user.email);
  }

  async signIn(data: SignInRequestBodyDto) {
    const userExists = await this.userRepository.findByEmail(data.email);

    if (!userExists) {
      throw new BadRequestException();
    }

    const isMatch = await bcrypt.compare(data.password, userExists.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return await this.generateTokenPair(userExists.id, userExists.email);
  }

  async signOut(userId: string) {
    await this.userRepository.clearRefreshToken(userId);
  }

  async generateTokenPair(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: '1h' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: '14d' },
    );

    await this.userRepository.saveRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }
}
