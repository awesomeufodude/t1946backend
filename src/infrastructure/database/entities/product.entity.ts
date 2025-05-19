import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessLine } from './business-line.entity';
import { ProductPrice } from './product-price.entity';
import { ProductStock } from './product-stock.entity';
import { ProductTire } from './product-tire.entity';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => BusinessLine, (businessLine) => businessLine.products)
  @JoinColumn({ name: 'business_line_id' })
  businessLine: BusinessLine;

  @OneToOne(() => ProductTire, (productTire) => productTire.product, { nullable: true })
  productTire: ProductTire | null;

  @Column({ type: 'boolean', nullable: false, default: true })
  showInPlp: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  noReplenish: boolean;

  @OneToMany(() => ProductStock, (productStock) => productStock.product)
  stocks: ProductStock[];

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.product)
  productPrices: ProductPrice[];

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'decimal', nullable: false })
  priceList: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
