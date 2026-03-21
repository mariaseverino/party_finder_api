import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpRequestBodyDto {
  @IsNotEmpty()
  nickname: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
