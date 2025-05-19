import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../admin/users/users.service';
import { AppointmentsService } from './appointments/appointments.service';
import { WorkordersService } from './workorders/workorders.service';
import { BudgetsService } from './budgets/budgets.service';
import { BussinessLineRepository } from 'src/infrastructure/database/repositories/bussiness-line.repository';
import { BudgetGroupRepository } from 'src/infrastructure/database/repositories/budget-group.repository';
import { WorkorderRepository } from 'src/infrastructure/database/repositories/workorder.repository';
import { SalesDto } from './sales.dto';
import { TYPE_SALES } from '../common/constants';

@Injectable()
export class SalesService {
  private readonly TIME_ZERO = 'T00:00:00';
  private readonly VIEW_TABLE_BUDGETS = 'VIEW_TABLE_BUDGETS';
  private readonly VIEW_TABLE_WORKORDERS = 'VIEW_TABLE_WORKORDERS';
  private readonly VIEW_TABLE_REASSIGNED_WORKORDERS = 'VIEW_TABLE_REASSIGNED_WORKORDERS';
  private readonly VIEW_TABLE_CONVERSATIONS = 'VIEW_TABLE_CONVERSATIONS';
  private readonly VIEW_TABLE_APPOINTMENTS = 'VIEW_TABLE_APPOINTMENTS';
  private readonly QUANTITY_TO_LOAD = 4;

  constructor(
    private readonly logger: Logger,
    private readonly usersService: UsersService,
    private readonly workordersService: WorkordersService,
    private readonly appointmentsService: AppointmentsService,
    private readonly budgetServicce: BudgetsService,
    private readonly bussinessLinesRepository: BussinessLineRepository,
    private readonly workordersRepository: WorkorderRepository,
    private readonly budgetGroupRepository: BudgetGroupRepository,
  ) {}

  async findAllSalesWithSecurityReviewByUserAndDate(userId: string, storeId: string, page: number = 1) {
    const user = await this.usersService.findById(userId);
    if (!user || !storeId) return { hasMore: false, registers: [] };
    const maxVisibleItems = page * this.QUANTITY_TO_LOAD;

    const conversations = await this.loadConversations(storeId, maxVisibleItems);
    const budgets = await this.loadBudgets(storeId, maxVisibleItems, conversations.length);

    const currentItemCount = conversations.length + budgets.length;
    const { items: workorders, hasMore } = await this.loadWorkorders(storeId, maxVisibleItems, currentItemCount);

    const typedConversations = conversations.map((item) => ({ ...item, type: TYPE_SALES.CONVERSATION }));
    const typedBudgets = budgets.map((item) => ({ ...item, type: TYPE_SALES.BUDGET }));
    const typedWorkorders = workorders.map((item) => ({ ...item, type: TYPE_SALES.WORKORDER }));

    const allSales = [...typedConversations, ...typedBudgets, ...typedWorkorders];

    const totalRecords = await this.totalRecords(storeId);
    return {
      totalRecords: totalRecords,
      length: allSales.length,
      hasMore,
      registers: allSales.map((item) => new SalesDto(item)),
    };
  }

  async findAllSalesByUserAndDate(userId: string, date: string, storeId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return [];

    const sales = [];
    const { permissions } = user.role;

    await this.addConversationsIfAllowed(userId, date, permissions, sales, storeId);
    await this.addBudgetsIfAllowed(userId, permissions, sales, storeId);
    await this.addAppointmentsIfAllowed(userId, date, storeId, permissions, sales);
    await this.addWorkordersIfAllowed(userId, date, permissions, sales, storeId);
    await this.addReassignedWorkordersIfAllowed(userId, date, permissions, sales, storeId);

    return sales;
  }

  async getMenu() {
    this.logger.log('getMenu');
    const menu = await this.bussinessLinesRepository.findAllActive();
    if (!menu || menu.length === 0) {
      throw new NotFoundException('No business lines found.');
    }
    return menu;
  }

  private async addConversationsIfAllowed(
    userId: string,
    date: string,
    permissions: any[],
    sales: any[],
    storeId: any,
  ) {
    const hasPermission = this.hasPermission(permissions, this.VIEW_TABLE_CONVERSATIONS);
    if (hasPermission) {
      const conversations = await this.budgetServicce.getConversationsByUser(userId, date, storeId);
      sales.push({ conversations });
    }
  }

  private async addBudgetsIfAllowed(userId: string, permissions: any[], sales: any[], storeId: any) {
    const hasPermission = this.hasPermission(permissions, this.VIEW_TABLE_BUDGETS);
    if (hasPermission) {
      const budgets = await this.budgetServicce.getBudgetsByUser(userId, storeId);
      sales.push({ budgets });
    }
  }

  private async addWorkordersIfAllowed(userId: string, date: string, permissions: any[], sales: any[], storeId: any) {
    const hasPermission = this.hasPermission(permissions, this.VIEW_TABLE_WORKORDERS);
    if (hasPermission) {
      const workorders = await this.workordersService.findByUserAndDate(userId, date, storeId);
      sales.push({ workorders });
    }
  }

  private async addReassignedWorkordersIfAllowed(
    userId: string,
    date: string,
    permissions: any[],
    sales: any[],
    storeId: any,
  ) {
    const hasPermission = this.hasPermission(permissions, this.VIEW_TABLE_REASSIGNED_WORKORDERS);
    if (hasPermission) {
      const reassignedWorkorders = await this.workordersService.findByUserAndDateReassigned(userId, date, storeId);
      sales.push({ 'reassigned-workorders': reassignedWorkorders });
    }
  }

  private async addAppointmentsIfAllowed(
    userId: string,
    date: string,
    storeId: string,
    permissions: any[],
    sales: any[],
  ) {
    const hasPermission = this.hasPermission(permissions, this.VIEW_TABLE_APPOINTMENTS);
    if (hasPermission) {
      const appointments = await this.appointmentsService.findByUserStoreAndDate(userId, storeId, date);
      sales.push({ appointments });
    }
  }

  private hasPermission(permissions: any[], permissionCode: string): boolean {
    const permission = permissions.some((permission) => permission.code === permissionCode);
    this.logger.log(`hasPermission ${permissionCode}: ${permission}`);
    return permission;
  }

  private async loadConversations(storeId: string, maxVisibleItems: number) {
    return this.budgetGroupRepository.findConversationWithSecurityReviewByStore(storeId, maxVisibleItems);
  }

  private async loadBudgets(storeId: string, maxVisibleItems: number, currentTotal: number) {
    const remaining = maxVisibleItems - currentTotal;
    if (remaining <= 0) return [];
    return this.budgetGroupRepository.findBudgetWithSecurityReviewByStore(storeId, remaining);
  }

  private async loadWorkorders(
    storeId: string,
    maxVisibleItems: number,
    currentTotal: number,
  ): Promise<{ items: any[]; hasMore: boolean }> {
    const remaining = maxVisibleItems - currentTotal;
    if (remaining <= 0) return { items: [], hasMore: true };

    const EXTRA_ITEM = 1;
    const raw = await this.workordersRepository.findWorkOrderWithSecurityReviewByStore(storeId, remaining + EXTRA_ITEM);

    if (raw.length > remaining) {
      return {
        items: raw.slice(0, remaining),
        hasMore: true,
      };
    }

    return {
      items: raw,
      hasMore: false,
    };
  }

  private async totalRecords(storeId: string) {
    const conversations = await this.budgetGroupRepository.totalRecordsConversation(storeId);
    const budgets = await this.budgetGroupRepository.totalRecordsBudget(storeId);
    const workorders = await this.workordersRepository.totalRecordsWorkorderByStore(storeId);
    return conversations + budgets + workorders;
  }
}
