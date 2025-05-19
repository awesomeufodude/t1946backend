import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Combo } from '../entities/combo.entity';
import { ProductTire } from '../entities/product-tire.entity';
import { Product } from '../entities/product.entity';
import { Service } from '../entities/service.entity';
import { AbstractRepository } from './abstract.repository';
import { ComboItem } from '../entities/combo-item.entity';

@Injectable()
export class ProductRepository extends AbstractRepository<Product> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(Product));
  }

  async findBySkuAndStore(sku: string, storeId: string): Promise<Product> {
    this.logger.log('findBySku');
    const product = await this.repository.findOne({
      where: { id: sku, productPrices: { store: { id: storeId } } },
      relations: ['productPrices', 'stocks', 'businessLine'],
    });
    return product;
  }

  async findTireBySku(sku: string, storeId: string): Promise<ProductTire> {
    this.logger.log('findTireBySku');
    const tire = await this.repository.manager
      .getRepository(ProductTire)
      .createQueryBuilder('productTire')
      .innerJoinAndSelect('productTire.product', 'product')
      .innerJoinAndSelect('productTire.brand', 'brand')
      .innerJoinAndSelect('product.stocks', 'stocks')
      .innerJoinAndSelect('product.productPrices', 'productPrices')
      .where('product.id = :sku', { sku })
      .andWhere('productPrices.store_id = :storeId', { storeId })
      .getOne();
    return tire;
  }

  async getTiresByMeasures(width: number, profile: number, rim: number, storeId: string): Promise<ProductTire[]> {
    this.logger.log('getTiresByMeasures');
    const tires = await this.repository.manager
      .getRepository(ProductTire)
      .createQueryBuilder('productTire')
      .innerJoinAndSelect('productTire.product', 'product')
      .innerJoinAndSelect('productTire.brand', 'brand')
      .innerJoinAndSelect('product.stocks', 'stocks')
      .innerJoinAndSelect('product.productPrices', 'productPrices')
      .innerJoin('stocks.store', 'store')
      .where('productTire.width = :width', { width })
      .andWhere('productTire.profile = :profile', { profile })
      .andWhere('productTire.rim = :rim', { rim })
      .andWhere('store.id = :storeId', { storeId })
      .andWhere('productPrices.store_id = :storeId', { storeId })
      .andWhere('stocks.stockReal > 0')
      .getMany();
    return tires;
  }

  async getProductCombo(storeId: string, rim: number): Promise<Combo> {
    this.logger.log('getProductCombo');
    const RIM = 'rims';
    const combo = await this.repository.manager
      .getRepository(Combo)
      .createQueryBuilder('combo')
      .innerJoinAndSelect('combo.comboItems', 'comboItems')
      .innerJoinAndSelect('comboItems.prices', 'comboItemPrices')
      .innerJoinAndSelect('comboItems.service', 'service')
      .where('combo.attributeCode = :attributeCode', { attributeCode: RIM })
      .andWhere('combo.attributeValue = :rim', { rim })
      .andWhere('combo.isActive = :isActive', { isActive: true })
      .andWhere('comboItemPrices.storeId = :storeId', { storeId })
      .getOne();
    return combo;
  }

  async getDataForService(serviceId: string): Promise<Service> {
    this.logger.log(`getDataForService: Fetching data for service with code: ${serviceId}`);
    const serviceData = await this.repository.manager
      .getRepository(Service)
      .createQueryBuilder('service')
      .where('service.code = :code', { code: serviceId })
      .getOne();
    return serviceData;
  }

  async getAddRecomendedServices(comboId: string, serviceCode: string): Promise<any> {
    const data = await this.repository.manager
      .getRepository(ComboItem)
      .createQueryBuilder('comboItem')
      .leftJoinAndSelect('comboItem.combo', 'combo')
      .leftJoinAndSelect('comboItem.service', 'service')
      .where('combo.id = :comboId', { comboId })
      .andWhere('service.code = :serviceCode', { serviceCode })
      .getMany();

    return data;
  }
}
