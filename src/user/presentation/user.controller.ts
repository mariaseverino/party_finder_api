import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { JwtAuthGuard } from 'common/jwt-auth.guard';
import { CurrentUser } from 'common/current-user.param';
import { type JwtPayload } from 'common/jwt-payload.type';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save-interests')
  create(@CurrentUser() user: JwtPayload, @Body('tags') tags: string[]) {
    return this.userService.saveInterests(user.email, tags);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findOne(user.email);
  }
}
