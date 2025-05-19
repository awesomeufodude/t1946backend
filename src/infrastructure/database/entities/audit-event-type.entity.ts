import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'audit_event_types' })
export class AuditEventType {
  @PrimaryColumn()
  code: string;

  @Column()
  description: string;
}
