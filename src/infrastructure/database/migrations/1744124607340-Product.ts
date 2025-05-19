import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Product1744124607340 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'business_line_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'show_in_plp',
            type: 'boolean',
            isNullable: false,
            default: 'true',
          },
          {
            name: 'no_replenish',
            type: 'boolean',
            isNullable: false,
            default: 'false',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'price_list',
            type: 'decimal',
            isNullable: false,
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
      }),
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['business_line_id'],
        referencedTableName: 'business_lines',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_products_business_line',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('products', 'FK_products_business_line');
    await queryRunner.dropTable('products');
  }
}
