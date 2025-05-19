import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CompanyBusiness } from '../entities/company-business.entity';

export class CompanySeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const companyBusinessRepository = dataSource.getRepository(CompanyBusiness);

    const companyBusinesses = await this.loadCompanyBusinesses(companyBusinessRepository);
    await companyBusinessRepository.save(companyBusinesses);
  }

  private async loadCompanyBusinesses(companyBusinessRepository: Repository<CompanyBusiness>) {
    const companyBusinessesData = [
      { name: 'Agricultura, ganadería, silvicultura y pesca' },
      { name: 'Explotación de minas y canteras' },
      { name: 'Industrias manufactureras' },
      { name: 'Suministro de electricidad, gas, vapor y aire acondicionado' },
      { name: 'Suministro de agua; evacuación de aguas residuales, gestión de desechos y descontaminación' },
      { name: 'Construcción' },
      { name: 'Comercio al por mayor y al por menor; reparación de vehículos automotores y motocicletas' },
      { name: 'Transporte y almacenamiento' },
      { name: 'Actividades de alojamiento y de servicio de comidas' },
      { name: 'Información y comunicaciones' },
      { name: 'Actividades financieras y de seguros' },
      { name: 'Actividades inmobiliarias' },
      { name: 'Actividades profesionales, científicas y técnicas' },
      { name: 'Actividades de servicios administrativos y de apoyo' },
      { name: 'Administración pública y defensa; planes de seguridad social de afiliación obligatoria' },
      { name: 'Enseñanza' },
      { name: 'Actividades de atención de la salud humana y de asistencia social' },
      { name: 'Actividades artísticas, de entretenimiento y recreativas' },
      { name: 'Otras actividades de servicios' },
      {
        name: 'Actividades de los hogares en calidad de empleadores; actividades no diferenciadas de los hogares como productores de bienes y servicios para uso propio',
      },
      { name: 'Actividades de organizaciones y órganos extraterritoriales' },
    ];

    const companyBusinesses = [];

    for (const companyBusinessData of companyBusinessesData) {
      const existingCompanyBusiness = await companyBusinessRepository.findOne({
        where: { company_business: companyBusinessData.name },
      });

      if (!existingCompanyBusiness) {
        const companyBusiness = new CompanyBusiness();
        companyBusiness.company_business = companyBusinessData.name;
        companyBusinesses.push(companyBusiness);
      }
    }

    return companyBusinesses;
  }
}
