import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Lead } from '../entities/lead.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class LeadRepository extends AbstractRepository<Lead> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Lead));
  }

  async search(search: string): Promise<Lead[]> {
    this.logger.log(`Searching leads with search term: ${search}`);

    const emailRegex = /@/;

    if (emailRegex.test(search)) {
      return this.searchByEmail(search);
    }

    return this.searchByFullName(search);
  }

  private async searchByEmail(search: string): Promise<Lead[]> {
    return this.repository
      .createQueryBuilder('lead')
      .where('lead.email ILIKE :search', { search: `%${search}%` })
      .getMany();
  }

  private async searchByFullName(search: string): Promise<Lead[]> {
    return this.repository
      .createQueryBuilder('lead')
      .where("CONCAT(lead.name, ' ', lead.lastname, ' ', lead.secondLastname) ILIKE :search", {
        search: `%${search}%`,
      })
      .getMany();
  }

  async save(lead: Lead): Promise<Lead> {
    return this.repository.save(lead);
  }

  async findByEmail(email: string): Promise<Lead | null> {
    return this.repository.findOne({
      where: { email },
      relations: ['budgetGroups'],
    });
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.repository.delete({ email });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findById(id: string): Promise<Lead | null> {
    return this.repository.findOneBy({ id });
  }
}
