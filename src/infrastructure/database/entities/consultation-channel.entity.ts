import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BudgetGroup } from './budget-group.entity';
import { CustomerPeople } from './customer-people.entity';
import { Lead } from './lead.entity';
import { Workorder } from './workorder.entity';

@Entity('consultation_channels')
export class ConsultationChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.consultationChannel)
  budgetGroups: BudgetGroup[];

  @OneToMany(() => Workorder, (workorder) => workorder.consultationChannel)
  workorders: Workorder[];

  @OneToMany(() => CustomerPeople, (customerPeople) => customerPeople.consultationChannel)
  customersPeople: CustomerPeople[];

  @OneToMany(() => Lead, (lead) => lead.consultationChannel)
  leads: Lead[];
}
