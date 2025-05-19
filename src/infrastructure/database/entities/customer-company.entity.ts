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
import { CompanyBusiness } from './company-business.entity';
import { ConsultationChannel } from './consultation-channel.entity';
import { CustomerCategory } from './customer-category.entity';
import { Customer } from './customer.entity';

@Entity('customers_company')
export class CustomerCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Customer, (customer) => customer.customerPeople)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'varchar', unique: true })
  rut: string;

  @Column({ type: 'varchar', nullable: true })
  legalName: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  officeAddress: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  addressLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  addressLongitude: number;

  @Column({ type: 'int', nullable: true })
  phoneZone: number;

  @Column({ type: 'int', nullable: true })
  phoneNumber: number;

  @Column({ type: 'varchar', nullable: true })
  contactName: string;

  @Column({ type: 'varchar', nullable: true })
  contactLastname: string;

  @Index('customers_company_email_idx', { unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  contactEmail: string;

  @Column({ type: 'int', nullable: true })
  contactPhoneZone: number;

  @Column({ type: 'bigint', nullable: true })
  contactPhoneNumber: number;

  @ManyToOne(() => CompanyBusiness, (companyBusiness) => companyBusiness.customersCompany, {
    eager: true,
    nullable: true,
  })
  companyBusiness: CompanyBusiness;

  @Column({ type: 'varchar', nullable: false })
  businessActivity: string;

  @ManyToOne(() => CustomerCategory, (customerCategory) => customerCategory.customersPeople)
  customerCategory: CustomerCategory;

  @ManyToOne(() => ConsultationChannel, (consultationChannel) => consultationChannel.customersPeople)
  consultationChannel: ConsultationChannel;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
