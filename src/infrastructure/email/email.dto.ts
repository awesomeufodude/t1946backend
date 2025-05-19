import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  template: string;
  text?: string;

  context?: { [key: string]: any };
}
