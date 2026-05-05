import { JwtPayload } from './jwt-payload.type';
import { JwtStrategy } from './jwt-strategy';

describe('JwtStrategy', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('constructor', () => {
    it('should throw if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;

      expect(() => new JwtStrategy()).toThrow('JWT_SECRET must be configured.');
    });

    it('should instantiate successfully when JWT_SECRET is set', () => {
      process.env.JWT_SECRET = 'test-secret';

      expect(() => new JwtStrategy()).not.toThrow();
    });
  });

  describe('validate', () => {
    it('should return the payload as-is', async () => {
      process.env.JWT_SECRET = 'test-secret';

      const strategy = new JwtStrategy();
      const payload: JwtPayload = { email: 'john@email.com', sub: 'user-id' };

      const result = await strategy.validate(payload);

      expect(result).toEqual(payload);
    });
  });
});
