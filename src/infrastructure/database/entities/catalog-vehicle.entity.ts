import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CatalogVehicleBrand } from './catalog-vehicle-brand.entity';
import { CatalogVehicleModel } from './catalog-vehicle-model.entity';
import { CatalogVehicleVersion } from './catalog-vehicle-version.entity';

@Index('catalog_vehicles_brand_model_idx', ['brand', 'model'])
@Index('catalog_vehicles_brand_model_version_idx', ['brand', 'model', 'version'])
@Entity('catalog_vehicles')
export class CatalogVehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('catalog_vehicles_brand_idx')
  @ManyToOne(() => CatalogVehicleBrand, (brand) => brand.vehicles, { eager: true })
  brand: CatalogVehicleBrand;

  @ManyToOne(() => CatalogVehicleModel, (model) => model.vehicles, { eager: true })
  model: CatalogVehicleModel;

  @ManyToOne(() => CatalogVehicleVersion, (version) => version.vehicles, { eager: true, nullable: true })
  version: CatalogVehicleVersion;

  @Column({ type: 'int' })
  year: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
