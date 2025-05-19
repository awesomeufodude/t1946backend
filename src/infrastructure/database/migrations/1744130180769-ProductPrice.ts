import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class ProductPrice1744130180769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_prices',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'store_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'price_store',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price_web',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price_tmk',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'product_prices',
      new TableIndex({
        name: 'product_prices_product_id_store_id_idx',
        columnNames: ['product_id', 'store_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKeys('product_prices', [
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('product_prices', 'product_prices_product_id_store_id_idx');
    await queryRunner.dropTable('product_prices');
  }
}
