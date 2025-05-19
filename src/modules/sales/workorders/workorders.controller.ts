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
import { GetWorkorderDto } from './get-workorders.dto';
import { RequestWorkorderDto } from './request-workorder.dto';
import { AssignWorkOrderDto, UpdateStatusDto, UpdateWorkOrderItemDto, WorkOrderParamsDto } from './workorders.dto';
import { WorkordersService } from './workorders.service';

@Controller('sales/v1/workorders')
export class WorkordersController {
  constructor(
    private readonly workordersService: WorkordersService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.VIEW_TABLE_WORKORDERS, AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS])
  @Get()
  async getAllWorkorderByUserAndDate(@Request() req, @Query(new ValidationPipe()) query: GetWorkorderDto) {
    this.logger.log('getAllConversationsByUserAndDate');
    const storeId = query.storeId;

    const selectedDate = query.date || new Date().toISOString().split('T')[0];
    const userId = req.user.sub;
    const role = req.user.role;
    const data = await this.workordersService.findByUserAndDate(userId, selectedDate, storeId, role);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_TABLE_WORKORDERS])
  @Post()
  async createWorkorder(@Request() req, @Body(new ValidationPipe()) requestWorkorderDto: RequestWorkorderDto) {
    this.logger.log('createWorkorder');
    const userId = req.user.sub;

    const data = await this.workordersService.createWorkorder({
      ...requestWorkorderDto,
      createdBy: userId,
    });

    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_TABLE_WORKORDERS, AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS])
  @Get(':id')
  async getWorkorderById(@Request() req, @Param('id') workorderId: number, @Query() query: WorkOrderParamsDto) {
    this.logger.log('getWorkorderById', workorderId, query);
    const userId = req.user.sub;
    const role = req.user.role;

    const data = await this.workordersService.findById(userId, workorderId, role, query.storeId, query.searchMode);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.DELETE_WORKORDER_ITEM])
  @Delete(':id/items/:itemId')
  async deleteWorkOrderItem(@Request() req, @Param('id') workOrderId, @Param('itemId') workorderItemId) {
    this.logger.log('deleteWorkOrderItem');
    const userId = req.user.sub;
    this.logger.log('workorderItemId', workorderItemId);
    await this.workordersService.deleteWorkOrderItem(userId, workOrderId, workorderItemId);
    return new SuccessDeleteReponseDto();
  }

  @Private([AppDomain.Permissions.UPDATE_WORKORDER_ITEM])
  @Patch(':id/items/:itemId/technician')
  async updateWorkOrderItemTechnician(
    @Request() req,
    @Param('id') workOrderId,
    @Param('itemId') workOrderitemId,
    @Body() body: UpdateWorkOrderItemDto,
  ) {
    this.logger.log('updateWorkOrderItemTechnician');
    const userId = req.user.sub;
    const data = await this.workordersService.updateWorkOrderItemTechnician(
      userId,
      workOrderId,
      workOrderitemId,
      body.technicianId,
    );

    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.REASSIGN_WORK_ORDER])
  @Patch(':id/users')
  async reassignWorkOrder(@Request() req, @Param('id') workOrderId, @Body() body: AssignWorkOrderDto) {
    this.logger.log('reassignWorkOrder');
    const userId = req.user.sub;

    const data = await this.workordersService.reassignWorkOrder(userId, body.userId, workOrderId);
    return new SuccessResponseDto(data);
  }

  @Post('/items')
  async addItemToWorkOrder(@Request() req, @Body() body: any) {
    this.logger.log('addItemToWorkOrder');
    const userId = req.user.sub;
    const data = await this.workordersService.addItemToWorkOrder(userId, body, body.workOrderId);
    return new SuccessResponseDto(data);
  }

  @Put(':id/items/:workorderItemId')
  async changeItemToWorkOrder(
    @Request() req,
    @Param('id') workOrderId,
    @Param('workorderItemId') workOrderItemId,
    @Body() body: any,
  ) {
    this.logger.log('changeItemToWorkOrder');
    const userId = req.user.sub;
    const data = await this.workordersService.changeItemToWorkOrder(userId, workOrderId, workOrderItemId, body);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS])
  @Post(':id/items/:workorderItemId/record-time')
  async startOrFinishRecordTime(
    @Request() req,
    @Param('id') workOrderId,
    @Param('workorderItemId') workOrderItemId,
    @Body() body: any,
  ) {
    this.logger.log('startOrFinishRecordTime');
    const userId = req.user.sub;
    const data = await this.workordersService.startOrFinishRecordTime(
      userId,
      workOrderId,
      workOrderItemId,
      body.action,
    );
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_ASSIGNED_WORKORDERS])
  @Post(':id/items/:workorderItemId/done')
  async finishWorkOrderItem(
    @Request() req,
    @Param('id') workOrderId,
    @Param('workorderItemId') workOrderItemId,
    @Body() body: any,
  ) {
    this.logger.log('finishWorkOrderItem');
    const userId = req.user.sub;
    const data = await this.workordersService.finishWorkOrderItem(userId, workOrderId, workOrderItemId, body.done);
    return new SuccessResponseDto(data);
  }

  @Patch('service/status')
  async updateStatusServiceWorkOrder(@Request() req, @Body() body: UpdateStatusDto) {
    this.logger.log('updateStatusServiceWorkOrder');
    const userId = req.user.sub;
    const data = await this.workordersService.updateStatusServiceWorkOrder(body, userId);
    return new SuccessResponseDto(data);
  }
}
