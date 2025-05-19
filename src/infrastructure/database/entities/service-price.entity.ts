import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Service } from './service.entity';

@Entity('service_prices')
export class ServicePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, (service) => service.prices, { nullable: false })
  @JoinColumn({ name: 'service_code' })
  service: Service;

  @Column({ type: 'varchar', nullable: false })
  storeId: string;

  @Column({ type: 'int', nullable: false })
  priceStore: number;

  @Column({ type: 'int', nullable: false })
  priceWeb: number;

  @Column({ type: 'int', nullable: false })
  priceTmk: number;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
