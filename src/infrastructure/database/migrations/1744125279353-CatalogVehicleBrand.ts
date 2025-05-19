import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CatalogVehicleBrand1744125279353 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'catalog_vehicles_brands',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'code_ws',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'img_url',
            type: 'varchar',
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
    );

    await queryRunner.createIndex(
      'catalog_vehicles_brands',
      new TableIndex({
        name: 'catalog_vehicles_brands_name_idx',
        columnNames: ['name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('catalog_vehicles_brands', 'catalog_vehicles_brands_name_idx');
    await queryRunner.dropTable('catalog_vehicles_brands');
  }
}
