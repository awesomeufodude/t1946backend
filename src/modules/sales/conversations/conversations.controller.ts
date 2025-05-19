import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from 'src/modules/admin/users/users.service';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { BudgetsService } from '../budgets/budgets.service';
import { ExtendConversationDto, GetConversationsDto, PostConversationDto, UpdateBudgetDto } from './conversations.dto';

@Controller('sales/v1/conversations')
export class ConversationsController {
  constructor(
    private readonly budgetService: BudgetsService,
    private readonly userService: UsersService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS])
  @Get(':id')
  async getConversationById(@Request() req, @Param('id') conversationId: number, @Query() query) {
    this.logger.log(`getConversationById ${JSON.stringify(query, null, 2)}`);
    const userId = req.user.sub;
    const role = req.user.role;
    const data = await this.budgetService.findConversationById(userId, conversationId, query.store, role);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS])
  @Get()
  async getAllConversationsByUserAndDate(@Request() req, @Query(new ValidationPipe()) query: GetConversationsDto) {
    this.logger.log('getAllConversationsByUserAndDate');
    const selectedDate = query.date || new Date().toISOString().split('T')[0];
    const userId = req.user.sub;
    const data = await this.budgetService.getConversationsByUser(userId, selectedDate, query.storeId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_BUDGETS])
  @Post()
  async createConversation(@Request() req, @Body(new ValidationPipe()) body: PostConversationDto) {
    this.logger.log('createConversation');
    const userId = req.user.sub;
    const data = await this.budgetService.createConversation(userId, body);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_BUDGETS])
  @Delete(':id')
  async deleteConversation(@Request() req, @Param('id') conversationId: number) {
    this.logger.log('deleteConversation');
    const userId = req.user.sub;
    const data = await this.budgetService.deleteConversation(userId, conversationId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_BUDGETS])
  @Patch(':id/extended')
  async extendConversation(@Request() req, @Param('id') conversationId: number, @Body() body: ExtendConversationDto) {
    this.logger.log('extendConversation');
    const userId = req.user.sub;
    const data = await this.budgetService.extendConversation(userId, conversationId, body.extended);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS])
  @Patch(':id')
  async updateConversationDataById(@Request() req, @Param('id') conversationId: number, @Body() body: UpdateBudgetDto) {
    this.logger.log(`updateConversationDataById ${conversationId}`);
    const userId = req.user.sub;
    const data = await this.budgetService.updateConversationDataById(userId, conversationId, body);
    return new SuccessResponseDto(data);
  }
}
