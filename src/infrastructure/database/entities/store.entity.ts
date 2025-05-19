import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BudgetGroup } from './budget-group.entity';
import { PasscodeCredential } from './passcode-credential.entity';
import { User } from './user.entity';
import { Workorder } from './workorder.entity';
import { ProductStock } from './product-stock.entity';
import { ProductPrice } from './product-price.entity';

@Entity({ name: 'stores' })
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  address: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.stores)
  users: User[];

  @ManyToOne(() => ProductStock, (productStock) => productStock.store)
  stocks: ProductStock[];

  @OneToMany(() => PasscodeCredential, (passcodeCredential) => passcodeCredential.store)
  passcodeCredentials: PasscodeCredential[];

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.store)
  budgetGroups: BudgetGroup[];

  @OneToMany(() => Workorder, (workorder) => workorder.store)
  workorders: Workorder[];

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.store)
  productPrices: ProductPrice[];
}
