import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ComboItem } from './combo-item.entity';

@Entity('combo_items_prices')
export class ComboItemPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ComboItem, (comboItem) => comboItem.prices, { nullable: false })
  @JoinColumn({ name: 'combo_item_id' })
  comboItem: ComboItem;

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
