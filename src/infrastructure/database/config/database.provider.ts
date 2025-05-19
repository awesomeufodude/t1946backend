import { appConstants } from 'src/config/app.constants';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BrandsHomologations } from '../entities/brand-homologation.entity';
import { Equifax2024 } from '../entities/equifax-2024.entity';
import { ModelsHomologations } from '../entities/model-homologation.entity';
import AppDataSource from './typeorm.config';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      return AppDataSource;
    },
  },
  {
    provide: 'EQUIFAX_DATA_SOURCE',
    useFactory: async () => {
      const equifaxDataSource = new DataSource({
        type: 'postgres',
        database: appConstants.DB_EQUIFAX_DATABASE,
        host: appConstants.DB_EQUIFAX_HOST,
        port: appConstants.DB_EQUIFAX_PORT,
        username: appConstants.DB_EQUIFAX_USERNAME,
        password: appConstants.DB_EQUIFAX_PASSWORD,
        entities: [BrandsHomologations, Equifax2024, ModelsHomologations],
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
      });

      return equifaxDataSource.initialize();
    },
  },
];
