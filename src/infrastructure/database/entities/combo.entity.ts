import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { ComboItem } from './combo-item.entity';
@Entity('combos')
@Index('attribute_code_attribute_value', ['attributeCode', 'attributeValue'], { unique: true })
export class Combo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  attributeCode: string;

  @Column({ type: 'varchar', nullable: true })
  attributeValue: string;

  @Column({ type: 'boolean', nullable: false })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => ComboItem, (comboItem) => comboItem.combo)
  comboItems: ComboItem[];
}
