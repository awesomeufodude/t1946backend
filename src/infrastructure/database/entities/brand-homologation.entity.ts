import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('brands_homologations')
export class BrandsHomologations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  marca: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;
}
