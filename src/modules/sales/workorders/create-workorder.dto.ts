import { AppDomain } from 'src/shared/domain/app.domain';
import { SalesDomain } from 'src/shared/domain/sales.domain';

export class CreateWorkorderDto {
  createdBy: string;
  channel: string;
  store: string;
  customer: string;
  vehicle?: string;
  budget?: string;
  consultationChannel?: string;
  odometer?: number;
  subTotal: number;
  discount?: number;
  iva: number;
  total: number;
  currency: number;
  deliveryTime: Date;
  deliveryMode: 'LEAVE' | 'WAIT';
  reassigned?: boolean;
  reassignedTo?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any, budget: any) {
    this.createdBy = data.createdBy;
    this.channel = 'STORE';
    this.store = budget.budgetGroup.store.id;
    this.customer = budget.budgetGroup.customer.id;
    this.vehicle = budget.budgetGroup.vehicle.id || null;
    this.budget = budget.id;
    this.consultationChannel = 'f9130d7b-23c3-464c-a565-071be0da31af';
    this.odometer = budget.budgetGroup.vehicle.odometer || null;
    this.subTotal = budget.subTotal;
    this.discount = budget.discount || 0;
    this.iva = budget.iva;
    this.total = budget.total;
    this.currency = AppDomain.Currencies.CLP;
    const [year, month, day] = data.deliveryDate.split('-').map(Number);
    const [hour, minute] = data.deliveryTime.split(':').map((val) => this.addLeadingZero(val));
    const deliveryDateTime = new Date(year, month - 1, day, hour, minute);
    this.deliveryTime = deliveryDateTime;
    this.deliveryMode = data.mode as 'LEAVE' | 'WAIT';
    this.reassigned = data.reassigned || false;
    this.reassignedTo = data.reassignedTo || null;
    this.status = SalesDomain.WORKORDERS_STATUS.IN_PROGRESS;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private addLeadingZero(value: string): string {
    return parseInt(value) < 10 ? `0${value}` : value;
  }
}
