import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CurrentUser } from 'src/common/current-user.param';
import { type JwtPayload } from 'src/common/jwt-payload.type';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';

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
