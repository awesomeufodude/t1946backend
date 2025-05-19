import { Controller, Get, Logger, NotFoundException, Param, Request } from '@nestjs/common';
import { NotAvailableInTouch, Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { UserDto } from './users.dto';
import { UsersService } from './users.service';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

@Controller('users/v1')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: Logger,
  ) {}

  @Get()
  @Private([AppDomain.Permissions.LIST_USERS])
  @NotAvailableInTouch()
  public async getAllUsers(@Request() req): Promise<SuccessResponseDto<UserDto[]>> {
    this.logger.log('getAllUsers');
    const users = await this.usersService.findAll(req.user);
    return new SuccessResponseDto(users);
  }

  @Get('/:rut')
  @Private([AppDomain.Permissions.LIST_USERS])
  public async getUserByRut(@Param('rut') rut: string): Promise<SuccessResponseDto<UserDto>> {
    this.logger.log(`getUserByRut: ${rut}`);
    const user = await this.usersService.findByRut(rut);
    if (!user) {
      throw new NotFoundException();
    }
    return new SuccessResponseDto(user);
  }
}
