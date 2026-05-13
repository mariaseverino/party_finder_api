import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryRpgGroupRepository } from 'rpg-group/infrastructure/in-memory-rpg-group.repository';
import request from 'supertest';
import { InMemoryUserRepository } from 'user/infrastructure/in-memory-user.repository';
import { AppModule } from '../src/app.module';
import { USER_REPOSITORY } from 'user/infrastructure/user.tokens';
import { RPG_GROUP_REPOSITORY } from 'rpg-group/infrastructure/rpg-group.tokens';
import { CreateRpgGroupRequestBodyDto } from 'rpg-group/dto/create-rpg-group.dto';
import { JwtRefreshAuthGuard } from 'auth/jwt-refresh-auth.guard';

describe('RpgGroupController (e2e)', () => {
  let app: INestApplication;
  let repoUser: InMemoryUserRepository;
  let repoRpg: InMemoryRpgGroupRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useClass(InMemoryUserRepository)
      .overrideProvider(RPG_GROUP_REPOSITORY)
      .useClass(InMemoryRpgGroupRepository)
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

    repoUser = app.get<InMemoryUserRepository>(USER_REPOSITORY, {
      strict: false,
    });
    repoRpg = app.get<InMemoryRpgGroupRepository>(RPG_GROUP_REPOSITORY, {
      strict: false,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await repoUser.clear();
    await repoRpg.clear();
  });

  describe('/rpg-group (POST)', () => {
    it('should create return 201', async () => {
      const user = await repoUser.create({
        email: 'john@email.com',
        nickname: 'john',
        password: '123456',
      });

      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: user.id,
        tags: ['1', '2'],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      await request(app.getHttpServer())
        .post('/rpg-group')
        .send(dto)
        .expect(201);
    });

    it('should throw if when rpg group is found', async () => {
      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: 'masterId',
        tags: ['1', '2'],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      await repoRpg.create(dto);

      await request(app.getHttpServer())
        .post('/rpg-group')
        .send(dto)
        .expect(400);
    });

    it('should throw 404 if master is not found', async () => {
      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Grupo Sem Mestre',
        masterId: 'id-inexistente',
        tags: ['1'],
        description: 'desc',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      await request(app.getHttpServer())
        .post('/rpg-group')
        .send(dto)
        .expect(404);
    });
  });

  describe('/rpg-group (GET)', () => {
    it('should return a list of rpg groups', async () => {
      const res = await request(app.getHttpServer())
        .get('/rpg-group')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        expect(res.body[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          nivel: expect.stringMatching(/novato|experiente/),
          platform: expect.stringMatching(/presencial|online|hibrido/),
          masterId: expect.any(String),
        });
      }
    });
  });

  describe('/rpg-group/:masterId (GET)', () => {
    it('should return all rpg groups of a master', async () => {
      const user = await repoUser.create({
        email: 'john@email.com',
        nickname: 'john',
        password: '123456',
      });

      const res = await request(app.getHttpServer())
        .get(`/rpg-group/${user.id}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);

      if (res.body.length > 0) {
        expect(res.body[0]).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          nivel: expect.stringMatching(/novato|experiente/),
          platform: expect.stringMatching(/presencial|online|hibrido/),
          masterId: expect.any(String),
        });
      }
    });
  });

  describe('/rpg-group/:id (GET)', () => {
    it('should return a rpg group by id', async () => {
      const user = await repoUser.create({
        email: 'john@email.com',
        nickname: 'john',
        password: '123456',
      });

      const dto: CreateRpgGroupRequestBodyDto = {
        name: 'Os Guardiões do Caos',
        masterId: user.id,
        tags: ['1', '2'],
        description:
          'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        genre: 'fantasia',
        nivel: 'novato',
        maxPlayers: 5,
        currentPlayers: 1,
        schedule: '',
        platform: 'presencial',
        location: 'sao paulo',
      };

      const createdRpgGroup = await repoRpg.create(dto);

      await request(app.getHttpServer())
        .get(`/rpg-group/${createdRpgGroup.id}`)
        .expect(200);
    });

    it('should throw an error if rpg group was not foud', async () => {
      await request(app.getHttpServer()).get('/rpg-group/id');
      expect(404);
    });
  });
});
