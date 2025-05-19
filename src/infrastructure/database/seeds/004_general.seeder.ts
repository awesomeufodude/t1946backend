import { DataSource, EntityManager } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BusinessLine } from '../entities/business-line.entity';
import { Service } from '../entities/service.entity';
import { ServicePrice } from '../entities/service-price.entity';
import { FakeUtils } from 'src/shared/utils/fake.utils';
import { Store } from '../entities/store.entity';

export class GeneralSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const manager = dataSource.createEntityManager();
    await this.loadServices(manager);
  }

  private async loadServices(manager: EntityManager): Promise<void> {
    const stores = await manager.find(Store);
    const businessLineRTP = await manager.findOne(BusinessLine, {
      where: { code: 'SECURITY_CHECK' },
    });

    const servicesData = [
      {
        code: 'MON001',
        description: 'Montaje',
        subcategoryId: 1,
        applyToCar: false,
        price: 0,
        explanationTitle: '¿Que es el Montaje?',
        explanationDescription:
          'Un neumático mal montado puede deformarse o dañarse, lo que podría causar un accidente al conducir. Por eso, es fundamental que un técnico calificado monte los neumáticos. En LEÓN tomamos las precauciones necesarias y utilizamos las mejores tecnologías, para asegurar que el neumático quede bien instalado y así hacer valer su garantía.',
        sortOrder: 1,
      },
      {
        code: 'BAL001',
        description: 'Balanceo',
        subcategoryId: 1,
        applyToCar: false,
        price: 8000,
        explanationTitle: '¿Que es el Balanceo?',
        explanationDescription:
          'Durante el balanceo se equilibra el peso de los neumáticos y de las llantas, ya que existen pequeñas diferencias entre cada lado. Durante este servicio, se corrigen estas imperfecciones mediante pequeños contrapesos que se colocan en la llanta. Cuando se instalan neumáticos nuevos, es importante que sean balanceados para asegurar que queden en perfectas condiciones y no se produzca una vibración al conducir.',
        sortOrder: 2,
      },
      {
        code: 'AL001',
        description: 'Alineación',
        subcategoryId: 1,
        applyToCar: true,
        price: 32500,
        explanationTitle: '¿Que es la Alineación?',
        explanationDescription:
          'El objetivo principal es que las ruedas de cada eje, así como los ejes entre sí, queden colocados de forma perfectamente paralela. Además, es necesario ajustar los ángulos de las ruedas según los valores dados por el fabricante. Realizar la alineación permite que tus neumáticos duren más, previniendo el desgaste irregular, disminuyendo la fricción y mejorando la conducción. Se recomienda alinear cada 10.000 kms. o cuando cambias tus neumáticos.',
        sortOrder: 3,
      },
      {
        code: 'ECO001',
        description: 'Ecotasa',
        subcategoryId: 1,
        applyToCar: false,
        price: 1250,
        explanationTitle: '¿Que es la Ecotasa?',
        explanationDescription:
          'Con la Ecotasa contribuyes a darle una nueva oportunidad a tus neumáticos viejos, a través del reciclaje. En LEÓN aseguramos una disposición final para aseguramos de que los neumáticos que recibimos se transformen en materia prima para ser utilizados en productos terminados, como pasto artificial, mezclas asfálticas, palmetas de pisos, juegos infantiles, plazas, canchas deportivas y veredas.',
        sortOrder: 5,
      },
      {
        code: 'GEXT',
        description: 'Garantía Extendida 6 Meses Adicionales',
        subcategoryId: 1,
        applyToCar: false,
        price: 6000,
        explanationTitle: '¿Que es la Garantía Extendida?',
        explanationDescription:
          '¡Aumenta la tranquilidad en cada kilómetro! Con nuestra Garantía Extendida de 6 Meses, tus neumáticos estarán protegidos contra cualquier daño irreparable que pueda ocurrir en la carretera. Este beneficio cubre todo tipo de eventos, brindando una protección adicional a la garantía que ya ofrece la marca de tus neumáticos. Porque sabemos que los imprevistos ocurren, con esta garantía te aseguramos que estarás cubierto para que sigas tu camino sin preocupaciones. ',
        sortOrder: 4,
      },
      {
        code: 'RTP',
        description: 'Revisión de Seguridad',
        subcategoryId: 1,
        applyToCar: true,
        price: 0,
        explanationTitle: '¿Que es la Revisión de Seguridad?',
        explanationDescription:
          'Cada cierta distancia recorrida, es necesario hacer un chequeo de las piezas y funcionamiento del auto. En LEÓN hacemos un diagnóstico gratuito y, si es necesario, recomendamos realizar algún recambio o reparación. Es importante efectuar una revisión periódica y preventiva del vehículo para evitar accidentes o desperfectos mayores.',
        sortOrder: 5,
      },
    ];

    for (const data of servicesData) {
      let service = await manager.findOne(Service, {
        where: { code: data.code },
      });

      if (!service) {
        service = manager.create(Service, {
          ...data,
          subcategoryId: 1,
          businessLine: data.code === 'RTP' ? businessLineRTP : null,
        });

        await manager.save(service);
      }

      for (const store of stores) {
        const exists = await manager.findOne(ServicePrice, {
          where: {
            service: { code: service.code },
            storeId: store.id,
          },
        });

        if (!exists) {
          const servicePrice = manager.create(ServicePrice, {
            service,
            storeId: store.id,
            priceStore: 1000 * FakeUtils.numberBetween(6, 15),
            priceWeb: 1000 * FakeUtils.numberBetween(6, 15),
            priceTmk: 1000 * FakeUtils.numberBetween(6, 15),
          });

          await manager.save(servicePrice);
        }
      }
    }
  }
}
