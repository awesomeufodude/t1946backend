import { Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { Customer } from './customer.entity';

@Entity('vehicles_customer')
@Index(['vehicle', 'customer'], { unique: true })
export class VehiclesCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.vehiclesCustomer, { nullable: false })
  vehicle: Vehicle;

  @ManyToOne(() => Customer, (customer) => customer.vehiclesCustomer, { nullable: false })
  customer: Customer;
}
