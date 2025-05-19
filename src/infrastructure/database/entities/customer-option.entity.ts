import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity'; // Asegúrate de que la ruta sea correcta

@Entity('customer_options')
export class CustomerOption {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Customer, (customer) => customer.customerOptions)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'boolean', default: false })
  sendPromotions: boolean;

  @Column({ type: 'boolean', default: false })
  sendNewsletters: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
