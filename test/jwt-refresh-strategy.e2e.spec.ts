import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { InMemoryUserRepository } from 'user/infrastructure/in-memory-user.repository';
import { AppModule } from '../src/app.module';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import cookieParser from 'cookie-parser';
import request from 'supertest';

describe('JwtRefreshStrategy (e2e)', () => {
  let app: INestApplication;
  let repoUser: InMemoryUserRepository;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    repoUser = app.get<InMemoryUserRepository>(USER_REPOSITORY, {
      strict: false,
    });
  });

  afterAll(async () => await app.close());
  beforeEach(async () => await repoUser.clear());

  it('should return 401 without refresh token cookie', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').expect(401);
  });

  it('should return 401 with invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', 'refresh_token=token-invalido')
      .expect(401);
  });

  it('should refresh and set new cookies with valid refresh token', async () => {
    const signUpRes = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: 'john@email.com', nickname: 'john', password: '123456' });

    const cookies = signUpRes.headers['set-cookie'];

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body).toEqual({ message: 'Token refreshed' });
  });

  it('should return 401 when refresh token is not in db', async () => {
    const signUpRes = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: 'john@email.com', nickname: 'john', password: '123456' });

    const cookies = signUpRes.headers['set-cookie'];

    await repoUser.clear();

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookies)
      .expect(401);
  });
});
