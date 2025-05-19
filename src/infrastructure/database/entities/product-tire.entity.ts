import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { Brand } from './brand.entity';
@Index('product_tires_measures_idx', ['width', 'profile', 'rim'])
@Entity('product_tires')
export class ProductTire {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('product_tires_product_id_idx')
  @OneToOne(() => Product, (product) => product.productTire, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', nullable: true })
  emotionalDescription: string;

  @Column({ type: 'varchar', nullable: true })
  design: string;

  @ManyToOne(() => Brand, (brand) => brand.productTires, { nullable: false })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Column({ type: 'enum', enum: ['R', 'D'], nullable: true })
  tireConstruction: string;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  profile: number;

  @Column({ type: 'int', nullable: true })
  rim: number;

  @Column({ type: 'varchar', nullable: true })
  speedIndex: string;

  @Column({ type: 'varchar', nullable: true })
  loadIndex: string;

  @Column({ type: 'varchar', nullable: true })
  utqgScore: string;

  @Column({ type: 'int', nullable: true })
  percentageOnRoad: number;

  @Column({ type: 'int', nullable: true })
  percentageOffRoad: number;

  @Column({ type: 'boolean', nullable: true })
  useCar: boolean;

  @Column({ type: 'boolean', nullable: true })
  useSuv: boolean;

  @Column({ type: 'boolean', nullable: true })
  useSport: boolean;

  @Column({ type: 'boolean', nullable: true })
  usePickup: boolean;

  @Column({ type: 'boolean', nullable: true })
  useCommercial: boolean;

  @Column({ type: 'boolean', nullable: true })
  highwayCompatible: boolean;

  @Column({ type: 'boolean', nullable: true })
  reinforced: boolean;

  @Column({ type: 'boolean', nullable: true })
  runFlat: boolean;

  @Column({ type: 'boolean', nullable: true })
  warrantyLeon: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
