import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from '../application/auth.service';
import { SignUpRequestBodyDto } from '../dto/sign-up.dto';
import { SignInRequestBodyDto } from '../dto/sign-in.dto';
import { JwtRefreshAuthGuard } from 'auth/jwt-refresh-auth.guard';
import { CurrentUser } from 'common/current-user.param';
import { type JwtPayload } from 'common/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signUp')
  async signUp(
    @Body() signUpDto: SignUpRequestBodyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(signUpDto);

    this.setAuthCookies(response, accessToken, refreshToken);

    return { message: 'User created' };
  }

  @Post('/signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInRequestBodyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    this.setAuthCookies(response, accessToken, refreshToken);

    return { message: 'User logged' };
  }

  @Post('/refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.generateTokenPair(user.sub, user.email);
    this.setAuthCookies(response, accessToken, refreshToken);

    return { message: 'Token refreshed' };
  }

  private setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const oneHour = 1000 * 60 * 60;
    const fourteenDays = 1000 * 60 * 60 * 24 * 14;

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: oneHour,
      expires: new Date(Date.now() + oneHour),
    });
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: fourteenDays,
      expires: new Date(Date.now() + fourteenDays),
    });
  }
}
