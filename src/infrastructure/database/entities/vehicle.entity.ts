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
import { BudgetGroup } from './budget-group.entity';
import { Workorder } from './workorder.entity';
import { VehiclesCustomer } from './vehicle-customer.entity';

@Index('plate_country_plate', ['plateCountry', 'plate'], { unique: true })
@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CatalogVehicle, { eager: true })
  vehicleCatalog: CatalogVehicle;

  @Column()
  plateCountry: string;

  @Column({ type: 'varchar' })
  plate: string;

  @Column({ type: 'varchar', nullable: true })
  color: string;

  @OneToMany(() => VehiclesCustomer, (vehicleCustomer) => vehicleCustomer.vehicle)
  vehiclesCustomer: VehiclesCustomer[];

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.vehicle)
  budgetGroups: BudgetGroup[];

  @OneToMany(() => Workorder, (workorder) => workorder.vehicle)
  workorders: Workorder[];

  @Column({ type: 'int', nullable: true })
  odometer: number;

  @Column({ type: 'timestamp', nullable: true })
  odometerUpdateDate: Date;

  @Column({ type: 'varchar', nullable: true })
  owner: string;

  @Column({ type: 'varchar', nullable: true })
  technicalReviewMonth: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
