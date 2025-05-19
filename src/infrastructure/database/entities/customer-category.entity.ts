import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CustomerPeople } from './customer-people.entity';

@Entity('customer_categories')
export class CustomerCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  category: string;

  @OneToMany(() => CustomerPeople, (customerPeople) => customerPeople.customerCategory)
  customersPeople: CustomerPeople[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
