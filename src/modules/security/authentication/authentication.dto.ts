import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  scope: string;
}

export class LoginResponseDto {
  token: string;
}
