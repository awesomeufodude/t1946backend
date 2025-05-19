import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Product } from './product.entity';

@Entity('business_lines')
export class BusinessLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: false, type: 'boolean', nullable: false })
  active: boolean;

  @Column({ type: 'varchar', nullable: false })
  image: string;

  @Column({ type: 'varchar', nullable: true })
  url: string;

  @Column({ type: 'int', nullable: false })
  order: number;

  @Column({ type: 'varchar', nullable: false })
  code: string;

  @ManyToMany(() => Brand, (brand) => brand.businessLines)
  brands: Brand[];

  @OneToMany(() => Product, (product) => product.businessLine)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
