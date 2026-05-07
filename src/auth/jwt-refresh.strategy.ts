import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../common/jwt-payload.type';
import { Request } from 'express';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import { type UserRepository } from 'user/domain/user.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be configured.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.refresh_token,
      ]),
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const result = await this.userRepository.findRefreshToken(payload.sub);

    if (!result?.token || result.token !== req.cookies?.refresh_token) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
