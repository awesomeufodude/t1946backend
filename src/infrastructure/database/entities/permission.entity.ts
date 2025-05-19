import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Module } from './module.entity';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryColumn()
  code: string;

  @Column()
  name: string;

  @ManyToOne(() => Module, { eager: true })
  module: Module;

  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
