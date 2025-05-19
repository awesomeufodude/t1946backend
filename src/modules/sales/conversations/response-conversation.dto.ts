import { BudgetGroup } from 'src/infrastructure/database/entities/budget-group.entity';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { Lead } from 'src/infrastructure/database/entities/lead.entity';
import { CoreDtos } from 'src/shared/dtos/core.dto';

export class ResponseConversationDto {
  id: number;
  createdBy: CoreDtos.UserDto;
  customer: Customer;
  lead: Lead;
  vehicle: CoreDtos.VehicleDto | null;
  budgets: CoreDtos.BudgetDto[] | [];
  extended: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(conversation: BudgetGroup) {
    this.id = conversation.id;
    this.createdBy = new CoreDtos.UserDto(conversation.createdBy);
    this.customer = conversation.customer;
    this.lead = conversation.lead;
    this.vehicle = conversation.vehicle ? new CoreDtos.VehicleDto(conversation.vehicle) : null;
    this.budgets = conversation.budgets ? conversation.budgets.map((budget) => new CoreDtos.BudgetDto(budget)) : [];
    this.createdAt = conversation.createdAt;
    this.extended = conversation.extended;
    this.expiresAt = conversation.expiresAt;
  }
}
