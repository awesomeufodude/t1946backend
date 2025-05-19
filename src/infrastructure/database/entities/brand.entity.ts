import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  OneToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { ProductTire } from './product-tire.entity';
import { BusinessLine } from './business-line.entity';

@Entity('brands')
export class Brand {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @OneToOne(() => ProductTire, (productTire) => productTire.brand)
  productTires: ProductTire;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  brandLogo?: string;

  @Column({ type: 'boolean', default: false })
  hasCorporateAgreement: boolean;

  @Column({ type: 'float', nullable: true })
  corporateDiscount?: number;

  @ManyToMany(() => BusinessLine, (businessLine) => businessLine.brands)
  @JoinTable({
    name: 'brand_business_line',
    joinColumn: { name: 'brand_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'business_line_id', referencedColumnName: 'id' },
  })
  businessLines: BusinessLine[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
