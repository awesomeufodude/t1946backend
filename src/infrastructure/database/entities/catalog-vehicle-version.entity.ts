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
import { CatalogVehicleModel } from './catalog-vehicle-model.entity';

@Entity('catalog_vehicles_versions')
export class CatalogVehicleVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('catalog_vehicles_versions_name_idx')
  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'code_ws', type: 'varchar', nullable: true })
  codeWs?: string;

  @Column({ name: 'img_url', type: 'varchar', nullable: true })
  imgUrl?: string;

  @OneToMany(() => CatalogVehicle, (vehicle) => vehicle.version)
  vehicles: CatalogVehicle[];

  @Index('catalog_vehicles_versions_model_idx')
  @ManyToOne(() => CatalogVehicleModel, (model) => model.versions)
  model: CatalogVehicleModel;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
