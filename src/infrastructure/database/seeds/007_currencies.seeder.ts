import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Currency } from '../entities/currency.entity';

export class CurrencySeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const currencyRepository = dataSource.getRepository(Currency);

    const existingCurrency = await currencyRepository.findOne({
      where: { code: 'CLP' },
    });

    if (!existingCurrency) {
      const currency = new Currency();
      currency.id = 152;
      currency.code = 'CLP';
      currency.name = 'Peso chileno';
      currency.decimals = 0;

      await currencyRepository.save(currency);
    }
  }
}
