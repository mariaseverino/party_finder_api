import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpRequestBodyDto {
  @IsNotEmpty()
  nickname: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class CreateUserDto {
  nickname: string;
  email: string;
  password: string;
}
