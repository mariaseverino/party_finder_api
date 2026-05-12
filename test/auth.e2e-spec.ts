import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { InMemoryUserRepository } from 'user/infrastructure/in-memory-user.repository';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import { AppModule } from '../src/app.module';
import { JwtRefreshAuthGuard } from 'auth/jwt-refresh-auth.guard';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let repo: InMemoryUserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .overrideGuard(JwtRefreshAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { email: 'john@email.com', sub: '' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    repo = app.get<InMemoryUserRepository>(USER_REPOSITORY);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repo.clear();
  });

  describe('/auth/signUp (POST)', () => {
    it('should create user and return 201', async () => {
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

    it('should return 400 when user is found', async () => {
      await request(app.getHttpServer()).post('/auth/signUp').send({
        nickname: 'John Doe',
        email: 'john@email.com',
        password: '123456',
      });

      await request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          email: 'john@email.com',
          password: '123456',
        })
        .expect(400);
    });
  });

  describe('/auth/signIn (POST)', () => {
    it('should log user', async () => {
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

    it('should return 400 when user is not found', async () => {
      await request(app.getHttpServer())
        .post('/auth/signIn')
        .send({
          email: 'john@email.com',
          password: '123456',
        })
        .expect(400);
    });

    it('should return 401 when password do not match', async () => {
      await request(app.getHttpServer()).post('/auth/signUp').send({
        nickname: 'John Doe',
        email: 'john@email.com',
        password: '123456',
      });

      await request(app.getHttpServer())
        .post('/auth/signIn')
        .send({
          email: 'john@email.com',
          password: '1234567',
        })
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh token and return a message', async () => {
      // faz signUp primeiro para ter usuário e refresh token no banco
      const signUpRes = await request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          nickname: 'John',
          email: 'john@email.com',
          password: '123456',
        });

      const cookies = signUpRes.headers['set-cookie'];

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies) // manda o refresh_token no cookie
        .expect(200);

      expect(res.body).toMatchObject({ message: 'Token refreshed' });
      expect(res.headers['set-cookie']).toBeDefined(); // novos cookies gerados
    });

    it('should set new cookies on refresh', async () => {
      const signUpRes = await request(app.getHttpServer())
        .post('/auth/signUp')
        .send({
          nickname: 'John',
          email: 'john@email.com',
          password: '123456',
        });

      const cookies = signUpRes.headers['set-cookie'];

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.headers['set-cookie']).toBeDefined();

      const newCookies = res.headers['set-cookie'] as unknown as string[];
      expect(newCookies.some((c) => c.startsWith('access_token'))).toBe(true);
      expect(newCookies.some((c) => c.startsWith('refresh_token'))).toBe(true);
    });
  });

  // describe('/auth/signOut (POST)', () => {
  //   it('should logout user', async () => {
  //     const signUpRes = await request(app.getHttpServer())
  //       .post('/auth/signUp')
  //       .send({
  //         nickname: 'John',
  //         email: 'john@email.com',
  //         password: '123456',
  //       });

  //     const cookies = signUpRes.headers['set-cookie'];

  //     await request(app.getHttpServer())
  //       .post('/auth/signOut')
  //       .set('Cookie', cookies)
  //       .expect(200);
  //   });
  // });
});
