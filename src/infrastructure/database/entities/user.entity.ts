import { IsOptional } from 'class-validator';
import { SecurityDomain } from 'src/shared/domain/security.domain';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BudgetGroup } from './budget-group.entity';
import { Note } from './note.entity';
import { PasscodeCredential } from './passcode-credential.entity';
import { Role } from './role.entity';
import { Store } from './store.entity';
import { WorkorderItemRecord } from './workorder-item-records.entity';
import { Workorder } from './workorder.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_users_rut', { unique: true })
  @Column()
  rut: string;

  @Column()
  name: string;

  @Column()
  lastname: string;

  @Index('idx_users_email', { unique: true })
  @Column({ nullable: false })
  email: string;

  @Column()
  passwordHash: string;

  @IsOptional()
  @Column({ nullable: true })
  avatarPath: string;

  @Column()
  jobRole: string;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column()
  phoneZone: number;

  @Column()
  phoneNumber: number;

  @Column({
    type: 'enum',
    enum: SecurityDomain.SecurityMethodTotem,
    default: SecurityDomain.SecurityMethodTotem.CODE,
  })
  securityMethodTotem: SecurityDomain.SecurityMethodTotem;

  @Column({ nullable: false })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Store, (store) => store.users)
  @JoinTable({
    name: 'user_stores',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'store_id', referencedColumnName: 'id' },
  })
  stores: Store[];

  @OneToMany(() => PasscodeCredential, (passcodeCredential) => passcodeCredential.user)
  passcodeCredentials: PasscodeCredential[];

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.createdBy)
  budgetGroups: BudgetGroup[];

  @OneToMany(() => WorkorderItemRecord, (workorderItemRecord) => workorderItemRecord.userAssigned)
  workorderItemRecords: WorkorderItemRecord[];

  @OneToMany(() => Note, (note) => note.createdBy)
  notes: Note[];

  @OneToMany(() => Workorder, (workorder) => workorder.createdBy)
  workorders: Workorder[];
}
