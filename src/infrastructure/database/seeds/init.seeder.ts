// tools/typeorm/seed.ts
import { runSeeders, Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { SystemParameterSeeder } from './002_systemparameters.seeder';
import { UsersSeeder } from './001_users.seeder';
import { SaleSeeder } from './009_sales.seeder';
import { CurrencySeeder } from './007_currencies.seeder';
import { LaborTimeSeeder } from './006_labortimes.seeder';
import { CompanySeeder } from './008_companies.seeder';
import { TimeSlotSeeder } from './011_timeslots.seeder';
import { BusinessLineSeeder } from './003_businessline.seeder';
import { GeneralSeeder } from './004_general.seeder';
import { ServiceItemSeeder } from './010_serviceitems.seeder';
import { ProductSeeder } from './005_products.seeder';
import { ServiceImagesSeeder } from './012_serviceimages.seeder';

export default class InitSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    await runSeeders(dataSource, {
      seeds: [
        UsersSeeder,
        SystemParameterSeeder,
        BusinessLineSeeder,
        GeneralSeeder,
        ProductSeeder,
        SaleSeeder,
        LaborTimeSeeder,
        CurrencySeeder,
        CompanySeeder,
        TimeSlotSeeder,
        ServiceItemSeeder,
        ServiceImagesSeeder,
      ],
    });
  }
}
