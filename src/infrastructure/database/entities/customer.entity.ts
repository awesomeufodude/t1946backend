import { CustomersDomain } from 'src/shared/domain/customers.domain';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BudgetGroup } from './budget-group.entity';
import { CustomerCompany } from './customer-company.entity';
import { CustomerOption } from './customer-option.entity';
import { CustomerPeople } from './customer-people.entity';
import { VehiclesCustomer } from './vehicle-customer.entity';
import { Workorder } from './workorder.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('customers_document_type_idx')
  @Column({ type: 'enum', enum: CustomersDomain.CustomerType })
  customerType: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => VehiclesCustomer, (vehicleCustomer) => vehicleCustomer.customer)
  vehiclesCustomer: VehiclesCustomer[];

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.customer)
  budgetGroups: BudgetGroup[];

  @OneToMany(() => Workorder, (workorder) => workorder.customer)
  workorders: Workorder[];

  @OneToOne(() => CustomerPeople, (customerPeople) => customerPeople.customer, { eager: true })
  customerPeople: CustomerPeople;

  @OneToOne(() => CustomerCompany, (customerCompany) => customerCompany.customer, { eager: true })
  customerCompany: CustomerCompany;

  @OneToOne(() => CustomerOption, (customerOption) => customerOption.customer, { eager: true })
  customerOptions: CustomerOption;
}
