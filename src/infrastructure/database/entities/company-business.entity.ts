import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CustomerCompany } from './customer-company.entity';

@Entity('company_business')
export class CompanyBusiness {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  company_business: string;

  @OneToMany(() => CustomerCompany, (customerCompany) => customerCompany.companyBusiness)
  customersCompany: CustomerCompany[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
