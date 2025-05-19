import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CatalogVehicle } from './catalog-vehicle.entity';
import { CatalogVehicleModel } from './catalog-vehicle-model.entity';

@Entity('catalog_vehicles_brands')
export class CatalogVehicleBrand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('catalog_vehicles_brands_name_idx')
  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'code_ws', type: 'varchar', nullable: true })
  codeWs?: string;

  @Column({ name: 'img_url', type: 'varchar', nullable: true })
  imgUrl?: string;

  @OneToMany(() => CatalogVehicle, (vehicle) => vehicle.brand)
  vehicles: CatalogVehicle[];

  @OneToMany(() => CatalogVehicleModel, (model) => model.brand)
  models: CatalogVehicleModel[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
