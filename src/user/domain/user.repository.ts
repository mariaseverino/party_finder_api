import { CreateUserDto } from '../dto/create-user.dto';
import { User } from './user.entity';

export interface UserRepository {
  create(data: CreateUserDto): Promise<User>;

  findById(id: string): Promise<User | undefined>;

  findByEmail(email: string): Promise<User | undefined>;

  saveInterests(userId: string, tags: string[]): Promise<void>;

  findExistingTags(tagIds: string[]): Promise<string[]>;
}
