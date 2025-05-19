import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessDeleteReponseDto, SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import {
  CreateBudgetDto,
  PatchUpdateItemDto,
  PostNewItemDto,
  PutChangeItemDto,
} from '../conversations/conversations.dto';
import { BudgetsService } from './budgets.service';
import { GetBudgetsDto, UpdateStatusDto } from './get-budgets.dto';

@Controller('sales/v1/budgets')
export class BudgetsController {
  constructor(
    private readonly budgetsService: BudgetsService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.VIEW_TABLE_BUDGETS])
  @Get()
  async getAllConversationsByUserAndDate(@Request() req, @Query(new ValidationPipe()) query: GetBudgetsDto) {
    this.logger.log('getAllConversationsAndButgetsByUserAndDate');
    const selectedDate = query.date || new Date().toISOString().split('T')[0];
    this.logger.log('selectedDate', selectedDate);
    const userId = req.user.sub;
    const data = await this.budgetsService.getBudgetsByUser(userId, query.storeId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_BUDGETS])
  @Patch('status')
  async updateBudgetStatus(@Body('status') statusCode: string, @Body('ids') ids: string[]) {
    const updatedBudget = await this.budgetsService.updateBudgetStatus(ids, statusCode);
    return new SuccessResponseDto(updatedBudget);
  }

  @Private([AppDomain.Permissions.CREATE_BUDGETS])
  @Post(':id/items')
  async addItemToConversation(@Request() req, @Param('id') budgetId, @Body() body: PostNewItemDto) {
    this.logger.log('addItemToConversation');
    const userId = req.user.sub;
    const data = await this.budgetsService.addItemToConversation(userId, budgetId, body);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.UPDATE_BUDGET_ITEM])
  @Patch(':id/items/:itemId')
  async updateItemToConversation(
    @Request() req,
    @Param('id') budgetId,
    @Param('itemId') itemId,
    @Body() body: PatchUpdateItemDto,
  ) {
    this.logger.log('updateItemToConversation');
    const userId = req.user.sub;
    const data = await this.budgetsService.updateItemToConversation(userId, budgetId, itemId, body);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.DELETE_BUDGET_ITEM])
  @Delete(':id/items/:itemId')
  async deleteItemToConversation(@Request() req, @Param('id') budgetId, @Param('itemId') itemId) {
    this.logger.log('deleteItemToConversation');
    const userId = req.user.sub;
    this.logger.log('itemId', itemId);
    await this.budgetsService.deleteItemToConversation(userId, budgetId, itemId);
    return new SuccessDeleteReponseDto();
  }

  @Private([AppDomain.Permissions.CHANGE_BUDGET_ITEM])
  @Put(':id/items/:itemId')
  async changeItemToConversation(
    @Request() req,
    @Param('id') budgetId: string,
    @Param('itemId') itemId: string,
    @Body() body: PutChangeItemDto,
  ) {
    this.logger.log('changeItemToConversation');
    const userId = req.user.sub;
    const data = await this.budgetsService.changeItemToConversation(userId, budgetId, itemId, body);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.SENT_BUDGET])
  @Post(':id/sent')
  async sentBudget(@Request() req, @Param('id') budgetId: string) {
    this.logger.log('sentBudget');
    const userId = req.user.sub;
    const data = await this.budgetsService.sentBudget(userId, budgetId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_BUDGETS])
  @Post()
  async createBudget(@Request() req, @Body() body: CreateBudgetDto) {
    this.logger.log('createBudget', body);
    const userId = req.user.sub;
    const budgetIdReference = body.budgetIdReference;
    const data = await this.budgetsService.createBudget(userId, budgetIdReference);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.DELETE_BUDGET])
  @Delete(':id')
  async deleteBudget(@Request() req, @Param('id') budgetId: string) {
    this.logger.log('deleteBudget');
    const userId = req.user.sub;
    await this.budgetsService.deleteBudget(budgetId, userId);
    return new SuccessDeleteReponseDto();
  }

  @Patch('service/status')
  async updateStatusServiceBudget(@Request() req, @Body() body: UpdateStatusDto) {
    this.logger.log('updateStatusServiceBudget');
    const userId = req.user.sub;
    const data = await this.budgetsService.updateStatusServiceBudget(body, userId);
    return new SuccessResponseDto(data);
  }
}
