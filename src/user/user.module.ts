import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { USER_REPOSITORY } from './infrastructure/user.tokens';
import { DrizzleUserRepository } from './infrastructure/drizzle-user.repository';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
  imports: [CommonModule],
})
export class UserModule {}
