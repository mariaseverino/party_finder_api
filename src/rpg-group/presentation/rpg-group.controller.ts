import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from 'auth/jwt-refresh-auth.guard';
import { RpgGroupService } from 'rpg-group/application/rpg-group.service';
import { CreateRpgGroupRequestBodyDto } from 'rpg-group/dto/create-rpg-group.dto';
import { GroupMembershipDto } from 'rpg-group/dto/rpg-group-membership.dto';

@Controller('rpg-group')
export class RpgGroupController {
  constructor(private readonly rpgGroupService: RpgGroupService) {}

  @UseGuards(JwtRefreshAuthGuard)
  @Post()
  create(@Body() data: CreateRpgGroupRequestBodyDto) {
    return this.rpgGroupService.create(data);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get()
  getAll() {
    return this.rpgGroupService.getAll();
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get(':masterId')
  getMasterRpgGroups(@Param('masterId') masterId: string) {
    return this.rpgGroupService.getAllRpgGroupByMasterId(masterId);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get(':id')
  getRpgGroup(@Param('id') id: string) {
    return this.rpgGroupService.getRpgGroupById(id);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Patch('join')
  joinToRpgGroup(@Body() data: GroupMembershipDto) {
    return this.rpgGroupService.addMemberToRpgGroup(data);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Patch('leave')
  leaveToRpgGroup(@Body() data: GroupMembershipDto) {
    return this.rpgGroupService.removeMemberToRpgGroup(data);
  }
}
