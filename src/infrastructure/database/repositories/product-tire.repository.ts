import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AbstractRepository } from './abstract.repository';
import { ProductTire } from '../entities/product-tire.entity';

@Injectable()
export class ProductTireRepository extends AbstractRepository<ProductTire> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(ProductTire));
  }

  async findAllWidths() {
    return this.findUniqueValuesWithStockCheck({}, 'width');
  }

  async findProfilesByWidth(width: number) {
    return this.findUniqueValuesWithStockCheck({ width }, 'profile');
  }

  async findRimsByWidthAndProfile(width: number, profile: number) {
    return this.findUniqueValuesWithStockCheck({ width, profile }, 'rim');
  }

  private async findUniqueValuesWithStockCheck(whereClause: object, column: string) {
    const productsToShow = await this.getProductsToShow(whereClause, column);
    const productsNoStockNoReplenish = await this.getProductsNoStockNoReplenish();
    const filteredProducts = this.filterProducts(productsToShow, productsNoStockNoReplenish);
    return this.extractUniqueValues(filteredProducts, column);
  }

  private async getProductsToShow(whereClause: object, column: string) {
    return this.repository
      .createQueryBuilder('productTire')
      .leftJoinAndSelect('productTire.product', 'product')
      .leftJoinAndSelect('product.stocks', 'stock')
      .where('product.showInPlp = :showInPlp', { showInPlp: true })
      .andWhere(whereClause)
      .orderBy(`productTire.${column}`, 'ASC')
      .getMany();
  }

  private async getProductsNoStockNoReplenish() {
    const products = await this.repository
      .createQueryBuilder('productTire')
      .leftJoinAndSelect('productTire.product', 'product')
      .leftJoinAndSelect('product.stocks', 'stock', 'stock.product_id = product.id')
      .where('product.showInPlp = :showInPlp', { showInPlp: true })
      .andWhere('product.noReplenish = :noReplenish', { noReplenish: true })
      .getMany();
    return products;
  }

  private filterProducts(productsToShow: ProductTire[], productsNoStockNoReplenish: ProductTire[]) {
    return productsToShow.filter(
      (productA) => !productsNoStockNoReplenish.some((productB) => productB.id === productA.id),
    );
  }

  private extractUniqueValues(products: ProductTire[], column: string) {
    return [...new Set(products.map((item) => item[column]))];
  }
}
