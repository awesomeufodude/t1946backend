import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Store } from './store.entity';

@Index('product_stocks_product_id_store_id_idx', ['product', 'store'], { unique: true })
@Entity('product_stocks')
export class ProductStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.stocks, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Store, (store) => store.stocks, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'decimal', nullable: false })
  stockReal: number;

  @Column({ type: 'decimal', nullable: false, default: 0 })
  reserved: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
