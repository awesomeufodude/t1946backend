import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Store } from '../entities/store.entity';
import { LaborTime } from '../entities/labor-time.entity';

export class LaborTimeSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const storeRepository = dataSource.getRepository(Store);
    const laborTimeRepository = dataSource.getRepository(LaborTime);

    const laborTimes = await this.loadLaborTimes(storeRepository, laborTimeRepository);

    await laborTimeRepository.save(laborTimes);
  }

  private async loadLaborTimes(
    storeRepository: Repository<Store>,
    laborTimeRepository: Repository<LaborTime>,
  ): Promise<LaborTime[]> {
    const laborTimes = [];
    const stores = await this.getStores(storeRepository);
    for (const store of stores) {
      const existingLaborTime = await laborTimeRepository.findOne({
        where: { storeId: store.id, businessLineId: 1 },
      });

      if (!existingLaborTime) {
        const laborTime = new LaborTime();
        laborTime.storeId = store.id;
        laborTime.businessLineId = 1;
        laborTimes.push(laborTime);
      }
    }
    return laborTimes;
  }

  private async getStores(storeRepository: Repository<Store>): Promise<any> {
    return await storeRepository.find();
  }
}
