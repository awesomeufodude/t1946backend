import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ComboItem } from './combo-item.entity';
import { ServicePrice } from './service-price.entity';
import { BusinessLine } from './business-line.entity';

@Entity('services')
export class Service {
  @PrimaryColumn()
  code: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'int', nullable: false })
  subcategoryId: number;

  @Column({ type: 'boolean', nullable: true })
  applyToCar: boolean;

  @Column({ type: 'boolean', nullable: true })
  fixedQuantity: boolean;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column({ type: 'varchar', nullable: true })
  explanationTitle: string;

  @Column({ type: 'varchar', nullable: true })
  explanationDescription: string;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @OneToMany(() => ServicePrice, (servicePrice) => servicePrice.service)
  prices: ServicePrice[];

  @OneToMany(() => ComboItem, (comboItem) => comboItem.service)
  comboItems: ComboItem[];

  @ManyToOne(() => BusinessLine, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'business_line_id' })
  businessLine: BusinessLine;
}
