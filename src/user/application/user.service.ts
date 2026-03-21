import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { USER_REPOSITORY } from '../infrastructure/user.tokens';
import { type UserRepository } from '../domain/user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async saveInterests(userEmail: string, tags: string[]) {
    const userExists = await this.userRepository.findByEmail(userEmail);

    if (!userExists) {
      throw new BadRequestException();
    }

    const existingIds = await this.userRepository.findExistingTags(tags);

    const invalidIds = tags.filter((id) => !existingIds.includes(id));

    if (invalidIds.length) {
      throw new BadRequestException();
    }

    await this.userRepository.saveInterests(userExists.id, tags);
  }

  async findOne(email: string) {
    const userExists = await this.userRepository.findByEmail(email);

    if (!userExists) {
      throw new BadRequestException();
    }

    return userExists;
  }
}
