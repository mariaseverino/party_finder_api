import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AuthModule, UserModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
