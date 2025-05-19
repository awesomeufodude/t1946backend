import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CatalogVehicleVersion1744125280381 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'catalog_vehicles_versions',
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
            name: 'model_id',
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
      'catalog_vehicles_versions',
      new TableIndex({
        name: 'catalog_vehicles_versions_name_idx',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'catalog_vehicles_versions',
      new TableIndex({
        name: 'catalog_vehicles_versions_model_idx',
        columnNames: ['model_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'catalog_vehicles_versions',
      new TableForeignKey({
        columnNames: ['model_id'],
        referencedTableName: 'catalog_vehicles_models',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('catalog_vehicles_versions', 'catalog_vehicles_versions_model_idx');
    await queryRunner.dropIndex('catalog_vehicles_versions', 'catalog_vehicles_versions_name_idx');
    await queryRunner.dropTable('catalog_vehicles_versions');
  }
}
