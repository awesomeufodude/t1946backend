import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { appConstants } from 'src/config/app.constants';
import { SendEmailDto } from './email.dto';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;
  let logger: Logger;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const sendEmailDto: SendEmailDto = {
    to: 'test@example.com',
    subject: 'Test Subject',
    template: 'test-template',
    context: {
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerService, useValue: mockMailerService },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call sendMail with correctly parameters', async () => {
    await service.sendEmail(sendEmailDto);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      ...sendEmailDto,
      context: {
        ...sendEmailDto.context,
        baseUrlStaticFiles: appConstants.BASE_URL_STATIC_FILES,
      },
    });
  });

  it('it should log an error if sendMail fails', async () => {
    const error = new Error('Error sending email');

    jest.spyOn(mailerService, 'sendMail').mockRejectedValue(error);
    jest.spyOn(logger, 'error');

    await service.sendEmail(sendEmailDto);

    expect(logger.error).toHaveBeenCalledWith(error);
  });
});
