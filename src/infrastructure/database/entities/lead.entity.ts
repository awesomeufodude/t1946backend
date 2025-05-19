import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConsultationChannel } from './consultation-channel.entity';
import { BudgetGroup } from './budget-group.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  lastname: string;

  @Column({ type: 'varchar', nullable: true })
  secondLastname: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  phoneZone: number;

  @Column({ type: 'bigint', nullable: true })
  phoneNumber: number;

  @ManyToOne(() => ConsultationChannel, (consultationChannel) => consultationChannel.leads)
  consultationChannel: ConsultationChannel;

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.lead)
  budgetGroups: BudgetGroup[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
