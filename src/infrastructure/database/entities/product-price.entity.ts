import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { Store } from './store.entity';

@Index('product_prices_product_id_store_id_idx', ['product', 'store'], { unique: true })
@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.stocks, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Store, (store) => store.stocks, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'int', nullable: false })
  priceStore: number;

  @Column({ type: 'int', nullable: false })
  priceWeb: number;

  @Column({ type: 'int', nullable: false })
  priceTmk: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
