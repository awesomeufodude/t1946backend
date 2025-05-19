import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Combo } from './combo.entity';
import { Service } from './service.entity';
import { ComboItemPrice } from './combo-item-price.entity';

@Entity('combo_items')
export class ComboItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Combo, (combo) => combo.comboItems, { nullable: false })
  combo: Combo;

  @ManyToOne(() => Service, (service) => service.comboItems, { nullable: false })
  service: Service;

  @Column({ type: 'boolean', nullable: false })
  isOptional: boolean;

  @Column({ type: 'boolean', nullable: false })
  isRecommended: boolean;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => ComboItemPrice, (comboItemPrice) => comboItemPrice.comboItem)
  prices: ComboItemPrice[];
}
