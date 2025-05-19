import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { appConstants } from 'src/config/app.constants';
import { SendEmailDto } from './email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: Logger,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto) {
    try {
      this.logger.log(`Sending email to: ${sendEmailDto.to}`);
      sendEmailDto.context = {
        ...sendEmailDto.context,
        baseUrlStaticFiles: appConstants.BASE_URL_STATIC_FILES,
      };
      await this.mailerService.sendMail({
        ...sendEmailDto,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
