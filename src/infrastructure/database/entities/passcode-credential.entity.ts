import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Store } from './store.entity';

@Index('passcode_credentials_store_passcode_idx', ['store', 'passcodeHash'])
@Index('passcode_credentials_store_user_id_idx', ['store', 'user'])
@Entity('passcode_credentials')
export class PasscodeCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  passcodeHash: string;

  @Column({ type: 'timestamp', nullable: false })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.passcodeCredentials, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.passcodeCredentials, { nullable: false, eager: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
