import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { UserModule } from 'user/user.module';
import { CommonModule } from 'common/common.module';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshAuthGuard, JwtRefreshStrategy],
  imports: [UserModule, CommonModule],
})
export class AuthModule {}
