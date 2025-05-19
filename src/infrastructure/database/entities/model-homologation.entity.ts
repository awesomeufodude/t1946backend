import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('models_homologations')
export class ModelsHomologations {
  @PrimaryColumn()
  MARCA: string;

  @PrimaryColumn()
  MODELO: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  slug: string;
}
