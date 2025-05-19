import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { AuditEventType } from './audit-event-type.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('audit_logs_user_id_idx')
  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  userId: string;

  @Index('audit_logs_event_type_code_idx')
  @ManyToOne(() => AuditEventType, (auditEventType) => auditEventType.code, { nullable: false })
  @JoinColumn({ name: 'event_type_code' })
  eventTypeCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
