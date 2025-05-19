import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: '_seeds' })
export class _Seed {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('seeds_name_idx', { unique: true })
  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
