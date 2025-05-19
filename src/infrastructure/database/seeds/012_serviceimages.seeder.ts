import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Service } from '../entities/service.entity';
import { appConstants } from 'src/config/app.constants';

export class ServiceImagesSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const manager = dataSource.createEntityManager();
    const services = await manager.find(Service);

    for (const service of services) {
      if (!service.imageUrl) {
        service.imageUrl = this.generateImageUrl(service.code);
        await manager.save(service);
      }
    }
  }

  private generateImageUrl(code: string): string {
    const baseUrl = appConstants.BASE_URL_STATIC_FILES;
    const servicesPath = appConstants.SERVICES_PATH;

    if (!baseUrl || !servicesPath) {
      throw new Error('Environment variables BASE_URL_STATIC_FILES or SERVICES_PATH are not set.');
    }

    return `${baseUrl}/${servicesPath}/${code}/image.svg`;
  }
}
