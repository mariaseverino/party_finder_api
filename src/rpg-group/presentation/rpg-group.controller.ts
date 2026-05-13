import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtRefreshAuthGuard } from 'auth/jwt-refresh-auth.guard';
import { RpgGroupService } from 'rpg-group/application/rpg-group.service';
import { CreateRpgGroupRequestBodyDto } from 'rpg-group/dto/create-rpg-group.dto';

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
}
