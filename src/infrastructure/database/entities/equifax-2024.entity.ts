import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('equifax2024')
export class Equifax2024 {
  @PrimaryColumn()
  PPU: string;

  @Column()
  DV_PPU: string;

  @Column()
  MARCA: string;

  @Column()
  MODELO: string;

  @Column()
  ANIO_FABRICACION: string;

  @Column()
  TIPO_VEHICULO: string;

  @Column()
  FECHA_TRANSFERENCIA: string;

  @Column()
  COLOR: string;

  @Column()
  RESTO_COLOR: string;

  @Column()
  COD_CHASIS: string;

  @Column()
  COD_MOTOR: string;

  @Column()
  AVALUO_FISCAL: string;

  @Column()
  AVALUO_COMERCIAL: string;

  @Column()
  CLASIFICACION: string;

  @Column()
  RUTID: string;

  @Column()
  PATERNO: string;

  @Column()
  MATERNO: string;

  @Column()
  NOMBRES: string;

  @Column()
  RAZON_SOCIAL: string;

  @Column('int')
  procesoA: number;
}
