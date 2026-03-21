import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured.');
}

@Module({
  providers: [JwtAuthGuard],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [JwtAuthGuard],
})
export class CommonModule {}
