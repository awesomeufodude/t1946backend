import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Logger, Module } from '@nestjs/common';
import { join } from 'path';
import { appConstants } from 'src/config/app.constants';
import { EmailService } from './email.service';

@Module({
  controllers: [],
  providers: [EmailService, Logger],
  exports: [EmailService],
  imports: [
    MailerModule.forRoot({
      transport: {
        host: appConstants.MAIL_HOST,
        port: appConstants.MAIL_PORT,
        secure: true,
        auth: {
          user: appConstants.MAIL_USERNAME,
          pass: appConstants.MAIL_PASSWORD,
        },
        from: appConstants.MAIL_FROM_ADDRESS,
      },
      template: {
        dir: join(__dirname, '../../assets/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
})
export class EmailModule {}
