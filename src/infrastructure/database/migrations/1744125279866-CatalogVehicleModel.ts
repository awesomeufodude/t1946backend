import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CatalogVehicleModel1744125279866 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'catalog_vehicles_models',
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
            name: 'brand_id',
            type: 'uuid',
            isNullable: false,
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
      'catalog_vehicles_models',
      new TableIndex({
        name: 'catalog_vehicles_models_name_idx',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'catalog_vehicles_models',
      new TableIndex({
        name: 'catalog_vehicles_models_brand_idx',
        columnNames: ['brand_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'catalog_vehicles_models',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'catalog_vehicles_brands',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('catalog_vehicles_models', 'catalog_vehicles_models_brand_idx');
    await queryRunner.dropIndex('catalog_vehicles_models', 'catalog_vehicles_models_name_idx');
    await queryRunner.dropTable('catalog_vehicles_models');
  }
}
