import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { SearchHistory } from './search-history';

@Entity('search_criteria')
export class SearchCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  code: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.searchCriteria)
  searchHistories: SearchHistory[];
}
