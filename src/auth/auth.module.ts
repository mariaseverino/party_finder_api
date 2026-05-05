import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { UserModule } from 'user/user.module';
import { CommonModule } from 'common/common.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, CommonModule],
})
export class AuthModule {}
