import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ParameterType {
  ALPHA = 'ALPHA',
  NUMERIC = 'NUMERIC',
  CHECK = 'CHECK',
}

@Entity('system_parameters')
export class SystemParameter {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('system_parameters_parameter_name_idx', { unique: true })
  @Column({ type: 'varchar' })
  parameterName: string;

  @Column({ type: 'varchar' })
  parameterValue: string;

  @Column({ type: 'enum', enum: ParameterType })
  parameterType: ParameterType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
