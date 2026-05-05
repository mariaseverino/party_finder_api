import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'common/jwt-auth.guard';
import { RpgGroupService } from 'rpg-group/application/rpg-group.service';
import { CreateRpgGroupRequestBodyDto } from 'rpg-group/dto/create-rpg-group.dto';

@Controller('rpg-group')
export class RpgGroupController {
  constructor(private readonly rpgGroupService: RpgGroupService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: CreateRpgGroupRequestBodyDto) {
    return this.rpgGroupService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll() {
    return this.rpgGroupService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':masterId')
  getMasterRpgGroups(@Param('masterId') masterId: string) {
    return this.rpgGroupService.getAllRpgGroupByMasterId(masterId);
  }
}
