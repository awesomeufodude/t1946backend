import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_items_statuses')
export class ServiceItemsStatuses {
  @PrimaryColumn({ name: 'code', type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'description', type: 'varchar', length: 255, nullable: false })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
