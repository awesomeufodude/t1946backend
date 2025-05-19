import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConsultationChannel } from './consultation-channel.entity';
import { CustomerCategory } from './customer-category.entity';
import { Customer } from './customer.entity';
import { CustomersDomain } from 'src/shared/domain/customers.domain';

@Index('customers_people_customer_document_type_id_idx', ['documentType', 'documentId'])
@Entity('customers_people')
export class CustomerPeople {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Customer, (customer) => customer.customerPeople)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'enum', enum: CustomersDomain.DocumentType })
  documentType: string;

  @Column({ type: 'varchar', unique: true })
  documentId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  lastname: string;

  @Column({ type: 'varchar', nullable: true })
  secondLastname: string;

  @Index('customers_people_email_idx', { unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string;

  @Column({ type: 'int', nullable: true })
  phoneZone: number;

  @Column({ type: 'bigint', nullable: true })
  phoneNumber: number;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  addressNumber: number;

  @Column({ type: 'varchar', nullable: true })
  addresComment: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  addressLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  addressLongitude: number;

  @ManyToOne(() => CustomerCategory, (customerCategory) => customerCategory.customersPeople)
  customerCategory: CustomerCategory;

  @ManyToOne(() => ConsultationChannel, (consultationChannel) => consultationChannel.customersPeople)
  consultationChannel: ConsultationChannel;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
