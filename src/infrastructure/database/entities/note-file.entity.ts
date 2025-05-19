import { Note } from './note.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'note_files' })
export class NoteFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'enum', enum: ['image', 'video'], default: 'image' })
  type: 'image' | 'video';

  @ManyToOne(() => Note, (note) => note.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'note_id' })
  note: Note;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
