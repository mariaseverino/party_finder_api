import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { InMemoryUserRepository } from 'user/infrastructure/in-memory-user.repository';
import { AppModule } from '../src/app.module';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import request from 'supertest';
import { RPG_GROUP_REPOSITORY } from 'rpg-group/infrastructure/rpg-group.tokens';
import { InMemoryRpgGroupRepository } from 'rpg-group/infrastructure/in-memory-rpg-group.repository';
import cookieParser from 'cookie-parser';

describe('JwtStrategy (e2e)', () => {
  let app: INestApplication;
  let repoUser: InMemoryUserRepository;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .overrideProvider(RPG_GROUP_REPOSITORY)
      .useClass(InMemoryRpgGroupRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    repoUser = app.get<InMemoryUserRepository>(USER_REPOSITORY, {
      strict: false,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repoUser.clear();
  });

  it('should return 401 without cookie', async () => {
    await request(app.getHttpServer()).get('/rpg-group').expect(401);
  });

  it('should allow request with valid JWT cookie', async () => {
    const signUpRes = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: 'john@email.com', nickname: 'john', password: '123456' });

    const cookie = signUpRes.headers['set-cookie'];

    await request(app.getHttpServer())
      .get('/rpg-group')
      .set('Cookie', cookie)
      .expect(200);
  });

  it('should sign out and clear cookies', async () => {
    const signUpRes = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: 'john@email.com', nickname: 'john', password: '123456' });

    const cookie = signUpRes.headers['set-cookie'];

    const res = await request(app.getHttpServer())
      .post('/auth/signOut')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toEqual({ message: 'User logged out' });

    // verifica que os cookies foram limpos
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.includes('access_token=;'))).toBe(true);
    expect(cookies.some((c) => c.includes('refresh_token=;'))).toBe(true);
  });
});
