import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { InMemoryAuthRepository } from 'src/auth/infrastructure/auth.repository.inmemory';
import { AUTH_REPOSITORY } from 'src/auth/infrastructure/auth.tokens';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AUTH_REPOSITORY)
      .useClass(InMemoryAuthRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/signUp (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({
        nickname: 'John Doe',
        email: 'john@email.com',
        password: '123456',
      })
      .expect(201);

    expect(res.body).toEqual({
      message: 'User created',
    });

    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('/auth/signIn (POST)', async () => {
    await request(app.getHttpServer()).post('/auth/signUp').send({
      nickname: 'John Doe',
      email: 'john@email.com',
      password: '123456',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/signIn')
      .send({
        email: 'john@email.com',
        password: '123456',
      })
      .expect(200);

    expect(res.body).toEqual({
      message: 'User logged',
    });

    expect(res.headers['set-cookie']).toBeDefined();
  });
});
