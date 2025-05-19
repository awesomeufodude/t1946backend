import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class ProductTire1744130180115 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_tires',
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
            name: 'emotional_description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'design',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'brand_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'tire_construction',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'width',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'profile',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'rim',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'speed_index',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'load_index',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'utqg_score',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'percentage_on_road',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'percentage_off_road',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'use_car',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'use_suv',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'use_sport',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'use_pickup',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'use_commercial',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'highway_compatible',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'reinforced',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'run_flat',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'warranty_leon',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('product_tires', [
      new TableIndex({
        name: 'product_tires_measures_idx',
        columnNames: ['width', 'profile', 'rim'],
      }),
      new TableIndex({
        name: 'product_tires_product_id_idx',
        columnNames: ['product_id'],
      }),
    ]);

    await queryRunner.createForeignKeys('product_tires', [
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('product_tires', 'product_tires_measures_idx');
    await queryRunner.dropIndex('product_tires', 'product_tires_product_id_idx');
    await queryRunner.dropTable('product_tires');
  }
}
