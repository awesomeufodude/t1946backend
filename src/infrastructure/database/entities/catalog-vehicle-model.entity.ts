import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CatalogVehicle } from './catalog-vehicle.entity';
import { CatalogVehicleBrand } from './catalog-vehicle-brand.entity';
import { CatalogVehicleVersion } from './catalog-vehicle-version.entity';

@Entity('catalog_vehicles_models')
export class CatalogVehicleModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('catalog_vehicles_models_name_idx')
  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'code_ws', type: 'varchar', nullable: true })
  codeWs?: string;

  @OneToMany(() => CatalogVehicle, (vehicle) => vehicle.model)
  vehicles: CatalogVehicle[];

  @Index('catalog_vehicles_models_brand_idx')
  @ManyToOne(() => CatalogVehicleBrand, (brand) => brand.models)
  brand: CatalogVehicleBrand;

  @OneToMany(() => CatalogVehicleVersion, (version) => version.model)
  versions: CatalogVehicleVersion[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
