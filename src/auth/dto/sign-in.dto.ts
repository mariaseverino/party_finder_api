import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInRequestBodyDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
}
