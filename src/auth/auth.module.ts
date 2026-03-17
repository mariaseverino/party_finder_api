import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthRepositoryDrizzle } from './infrastructure/auth.repository.drizzle';
import { AUTH_REPOSITORY } from './infrastructure/auth.tokens';
import { AuthController } from './presentation/auth.controller';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured.');
}

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepositoryDrizzle,
    },
  ],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [AUTH_REPOSITORY],
})
export class AuthModule {}
