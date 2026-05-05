import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { InMemoryUserRepository } from 'user/infrastructure/in-memory-user.repository';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import { JwtAuthGuard } from 'common/jwt-auth.guard';
import { AppModule } from '../src/app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let repo: InMemoryUserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .overrideGuard(JwtAuthGuard)
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

  describe('/user/save-interests (POST)', () => {
    it('should save user interests and return 201', async () => {
      await repo.create({
        email: 'john@email.com',
        nickname: 'john',
        password: '123456',
      });

      await request(app.getHttpServer())
        .post('/user/save-interests')
        .send({ tags: ['1', '2'] })
        .expect(201);
    });

    it('should return 400 when user is not found', async () => {
      await request(app.getHttpServer())
        .post('/user/save-interests')
        .send({ tags: [] })
        .expect(400);
    });

    it('should return 400 when tags are invalid', async () => {
      await repo.create({
        email: 'john@email.com',
        nickname: 'john',
        password: '123456',
      });

      await request(app.getHttpServer())
        .post('/user/save-interests')
        .send({ tags: ['999'] })
        .expect(400);
    });
  });

  describe('/user/me (GET)', () => {
    it('should return the logged user', async () => {
      await repo.create({
        email: 'john@email.com',
        nickname: 'john',
        password: '123456',
      });

      const res = await request(app.getHttpServer())
        .get('/user/me')
        .expect(200);

      expect(res.body).toMatchObject({
        email: 'john@email.com',
        nickname: 'john',
      });
    });

    it('should return 400 when user is not found', async () => {
      await request(app.getHttpServer()).get('/user/me').expect(400);
    });
  });
});
