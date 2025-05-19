import { Body, Controller, Get, Logger, Post, Request, UnauthorizedException } from '@nestjs/common';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { LoginRequestDto } from './authentication.dto';
import { AuthenticationService } from './authentication.service';
import { Private, Public } from '../../../shared/decorators/auth.decorators';
import { SessionCodeRequestDto } from './session-code-dto';

@Controller('authentication/v1')
export class AuthenticationController {
  constructor(
    private readonly logger: Logger,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @Public()
  @Post('login')
  public async login(@Body() loginRequest: LoginRequestDto): Promise<SuccessResponseDto<AppDomain.Session>> {
    this.logger.log('login');
    const session = await this.authenticationService.login(loginRequest);
    if (!session) {
      throw new UnauthorizedException();
    }
    return new SuccessResponseDto(session);
  }

  @Public()
  @Post('totem/session-code')
  public async sessionCode(
    @Body() sessionCode: SessionCodeRequestDto,
  ): Promise<SuccessResponseDto<string | boolean | AppDomain.Session>> {
    this.logger.log('sessionCode');
    try {
      const response = await this.authenticationService.sessionCode(sessionCode);
      if (!response) {
        throw new UnauthorizedException();
      }
      return new SuccessResponseDto(response);
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException();
    }
  }

  @Get('/session')
  @Private([AppDomain.Permissions.ACCESS_MODULE_OPERATIONAL])
  public async getMe(@Request() req): Promise<SuccessResponseDto<AppDomain.Session>> {
    this.logger.log('getMe');
    const session = await this.authenticationService.findSessionByUser(req.user.sub, req.user.scope);
    return new SuccessResponseDto(session);
  }
}
