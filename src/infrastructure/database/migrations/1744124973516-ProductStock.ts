import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class ProductStock1744124973516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_stocks',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
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
            name: 'stock_real',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'reserved',
            type: 'decimal',
            isNullable: false,
            default: '0',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_product_stocks_product_store',
            columnNames: ['product_id', 'store_id'],
          }),
        ],
      }),
    );

    await queryRunner.createForeignKeys('product_stocks', [
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_product_stocks_product',
      }),
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_product_stocks_store',
      }),
    ]);

    await queryRunner.createForeignKey(
      'stores',
      new TableForeignKey({
        columnNames: ['stocks_id'],
        referencedTableName: 'product_stocks',
        referencedColumnNames: ['id'],
        name: 'FK_stores_stocks',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('stores', 'FK_stores_stocks');
    await queryRunner.dropForeignKey('product_stocks', 'FK_product_stocks_store');
    await queryRunner.dropForeignKey('product_stocks', 'FK_product_stocks_product');
    await queryRunner.dropTable('product_stocks');
  }
}
