import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { RpgGroupModule } from './rpg-group/rpg-group.module';

@Module({
  imports: [AuthModule, UserModule, CommonModule, RpgGroupModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
