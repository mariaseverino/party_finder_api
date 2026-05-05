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

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
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

    const payload = { sub: userExists.id, email: userExists.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
