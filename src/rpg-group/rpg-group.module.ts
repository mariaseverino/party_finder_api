import { Module } from '@nestjs/common';
import { RpgGroupService } from './application/rpg-group.service';
import { RPG_GROUP_REPOSITORY } from './infrastructure/rpg-group.tokens';
import { DrizzleRpgGroupRepository } from './infrastructure/drizzle-rpg-group.repository';
import { UserModule } from 'user/user.module';
import { CommonModule } from 'common/common.module';
import { RpgGroupController } from './presentation/rpg-group.controller';

@Module({
  controllers: [RpgGroupController],
  providers: [
    RpgGroupService,
    {
      provide: RPG_GROUP_REPOSITORY,
      useClass: DrizzleRpgGroupRepository,
    },
  ],
  imports: [UserModule, CommonModule],
  exports: [RPG_GROUP_REPOSITORY],
})
export class RpgGroupModule {}
