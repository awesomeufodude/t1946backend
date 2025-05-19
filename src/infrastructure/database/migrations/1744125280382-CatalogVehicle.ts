import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CatalogVehicle1744125280382 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'catalog_vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'brand_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'model_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'version_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'year',
            type: 'int',
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
      true,
    );

    await queryRunner.createForeignKeys('catalog_vehicles', [
      new TableForeignKey({
        name: 'FK_catalog_vehicles_brand',
        columnNames: ['brand_id'],
        referencedTableName: 'catalog_vehicles_brands',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        name: 'FK_catalog_vehicles_model',
        columnNames: ['model_id'],
        referencedTableName: 'catalog_vehicles_models',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        name: 'FK_catalog_vehicles_version',
        columnNames: ['version_id'],
        referencedTableName: 'catalog_vehicles_versions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createIndices('catalog_vehicles', [
      new TableIndex({
        name: 'catalog_vehicles_brand_idx',
        columnNames: ['brand_id'],
      }),
      new TableIndex({
        name: 'catalog_vehicles_brand_model_idx',
        columnNames: ['brand_id', 'model_id'],
      }),
      new TableIndex({
        name: 'catalog_vehicles_brand_model_version_idx',
        columnNames: ['brand_id', 'model_id', 'version_id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('catalog_vehicles', 'catalog_vehicles_brand_model_version_idx');
    await queryRunner.dropIndex('catalog_vehicles', 'catalog_vehicles_brand_model_idx');
    await queryRunner.dropIndex('catalog_vehicles', 'catalog_vehicles_brand_idx');

    await queryRunner.dropForeignKey('catalog_vehicles', 'FK_catalog_vehicles_brand');
    await queryRunner.dropForeignKey('catalog_vehicles', 'FK_catalog_vehicles_model');
    await queryRunner.dropForeignKey('catalog_vehicles', 'FK_catalog_vehicles_version');

    await queryRunner.dropTable('catalog_vehicles');
  }
}
