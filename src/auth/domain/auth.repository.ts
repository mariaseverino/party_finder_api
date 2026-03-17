import { CreateUserDto } from '../dto/sign-up.dto';

interface User {
  nickname: string;
  email: string;
  password: string;
  id: string;
}

export interface AuthRepository {
  create(data: CreateUserDto): Promise<User>;

  findById(id: string): Promise<User | undefined>;

  findByEmail(email: string): Promise<User | undefined>;
}
