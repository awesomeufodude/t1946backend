import { Controller, Get, Post, UploadedFile, UseInterceptors, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

@Controller('/common/v1')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly logger: Logger,
  ) {}

  @Get()
  findAll(): string {
    return 'This action returns all common resources';
  }
  @Private([AppDomain.Permissions.CREATE_NOTE])
  @Post('/speech-to-text')
  @UseInterceptors(FileInterceptor('audio'))
  async createTranscription(@UploadedFile() file: any) {
    this.logger.log('createTranscription');
    const data = await this.commonService.createTranscription(file);
    return new SuccessResponseDto(data);
  }
}
