import { DataSource, EntityManager } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { appConstants } from 'src/config/app.constants';
import { Store } from '../entities/store.entity';
import { ProductTire } from '../entities/product-tire.entity';
import { Combo } from '../entities/combo.entity';
import productsData from '../../../shared/domain/filtered_products.json';
import { Logger } from '@nestjs/common';
import { ProductStock } from '../entities/product-stock.entity';
import { ProductPrice } from '../entities/product-price.entity';
import { FakeUtils } from 'src/shared/utils/fake.utils';
import { ComboItem } from '../entities/combo-item.entity';
import { Service } from '../entities/service.entity';
import { ComboItemPrice } from '../entities/combo-item-price.entity';

export class ProductSeeder implements Seeder {
  private readonly TIRE = 'Neumáticos';
  private readonly baseUrl = `${appConstants.BASE_URL_STATIC_FILES}/${appConstants.SALES_MENU_PATH}/`;
  private readonly logger: Logger = new Logger('ProductSeeder');

  async run(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(Product);
    const manager = dataSource.createEntityManager();

    // Load products
    const products = await this.loadProducts(dataSource.createEntityManager());
    await productRepository.upsert(products, ['id']);

    await this.createComboItems(manager);
  }

  private async loadProducts(manager: EntityManager): Promise<Product[]> {
    const productsList: Product[] = [];

    const stores = await manager.find(Store);
    const brands = await manager.find(Brand, {
      relations: ['businessLines'],
    });

    let noReplenishCount = 0;

    const rimsSet = new Set();

    for (const data of productsData) {
      const brand = brands.find((b) => b.id === data.id_marca);

      const product = new Product();
      product.id = data.codigo;
      product.description = data.descripcion;
      product.priceList = data.precio_lista;

      product.businessLine = brand.businessLines ? brand.businessLines[0] : null;

      if (noReplenishCount < 3) {
        product.noReplenish = true;
        noReplenishCount++;
      } else {
        product.noReplenish = false;
      }

      product.showInPlp = true;

      await manager.save(product);

      let productTire = await manager.findOne(ProductTire, {
        where: { product: { id: product.id } },
      });

      if (!productTire) {
        productTire = new ProductTire();
        productTire.product = product;
        productTire.brand = brand;
        productTire.emotionalDescription = data.descripcion_emocional;
        productTire.design = data.diseno;
        productTire.tireConstruction = data.construccion;
        productTire.width = data.ancho;
        productTire.profile = data.perfil;
        productTire.rim = data.aro;
        productTire.speedIndex = data.velocidad;
        productTire.percentageOffRoad = data.porc_off_road;
        productTire.percentageOnRoad = data.porc_on_road;
        productTire.loadIndex = data.carga.toString();
        productTire.useCar = data.uso_auto === 'SI';
        productTire.useSuv = data.uso_suv === 'SI';
        productTire.useSport = data.uso_deportivo === 'SI';
        productTire.usePickup = data.uso_camioneta === 'SI';
        productTire.useCommercial = data.uso_comercial === 'SI';
        productTire.reinforced = data.reforzado === 'SI';
        productTire.warrantyLeon = true;

        await manager.save(productTire);
      }

      product.productTire = productTire;

      if (!rimsSet.has(productTire.rim)) {
        await this.createCombo(manager, productTire);
        rimsSet.add(productTire.rim);
      }

      for (const store of stores) {
        const existingProductStock = await manager.findOne(ProductStock, {
          where: {
            product: {
              id: product.id,
            },
            store: {
              id: store.id,
            },
          },
        });

        if (!existingProductStock) {
          const productStock = new ProductStock();
          productStock.product = product;
          productStock.store = store;
          if (product.noReplenish) {
            productStock.stockReal = 0;
          } else {
            productStock.stockReal = Math.floor(Math.random() * 100);
          }
          productStock.reserved = 0;
          await manager.save(productStock);
          const productPrice = new ProductPrice();
          productPrice.product = product;
          productPrice.store = store;
          productPrice.priceStore = 1000 * FakeUtils.numberBetween(80, 120);
          productPrice.priceWeb = 1000 * FakeUtils.numberBetween(80, 120);
          productPrice.priceTmk = 1000 * FakeUtils.numberBetween(80, 120);
          productPrice.createdAt = new Date();
          productPrice.updatedAt = new Date();
          await manager.save(productPrice);
        }
      }
      productsList.push(product);
    }

    return productsList;
  }

  private async createCombo(manager: EntityManager, productTire: ProductTire): Promise<Combo> {
    const existingCombo = await manager.findOne(Combo, {
      where: { attributeValue: productTire.rim.toString(), name: 'combo' },
    });

    if (existingCombo) {
      return existingCombo;
    }

    const combo = new Combo();
    combo.name = 'combo';
    combo.attributeCode = 'rims';
    combo.attributeValue = productTire.rim.toString();
    combo.isActive = true;

    await manager.save(combo);
    return combo;
  }

  private async createComboItems(manager: EntityManager): Promise<void> {
    const services = await manager.find(Service, {
      where: [{ code: 'MON001' }, { code: 'BAL001' }, { code: 'AL001' }, { code: 'ECO001' }, { code: 'GEXT' }],
    });

    if (!services.length) {
      throw new Error('No se encontraron servicios requeridos para combo items');
    }

    const combos = await manager.find(Combo);
    const stores = await manager.find(Store);

    for (const combo of combos) {
      for (const service of services) {
        const exists = await manager.findOne(ComboItem, {
          where: {
            combo: { id: combo.id },
            service: { code: service.code },
          },
        });

        if (!exists) {
          const comboItem = await manager.save(
            manager.create(ComboItem, {
              combo,
              service,
              isOptional: true,
              isRecommended: true,
            }),
          );

          for (const store of stores) {
            const comboItemPrice = manager.create(ComboItemPrice, {
              comboItem,
              storeId: store.id,
              priceStore: 1000 * FakeUtils.numberBetween(6, 12),
              priceWeb: 1000 * FakeUtils.numberBetween(6, 12),
              priceTmk: 1000 * FakeUtils.numberBetween(6, 12),
            });

            await manager.save(comboItemPrice);
          }
        }
      }
    }
  }
}
