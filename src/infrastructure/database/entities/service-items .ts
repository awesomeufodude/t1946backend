import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity({ name: 'service_items' })
export class ServiceItems {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_code', referencedColumnName: 'code' })
  service: Service;

  @Column({ name: 'name', type: 'varchar', nullable: false, length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image', type: 'varchar', nullable: true })
  image: string;

  @Column({ name: 'order', type: 'int', nullable: false })
  order: number;

  @Column({ name: 'code', type: 'varchar', nullable: false, length: 50 })
  code: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
