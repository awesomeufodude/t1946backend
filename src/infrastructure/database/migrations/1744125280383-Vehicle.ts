import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class Vehicle1744125280383 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vehicle_catalog_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'plate_country',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'plate',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'odometer',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'odometer_update_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'owner',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'technical_review_month',
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
      true,
    );

    await queryRunner.createIndex(
      'vehicles',
      new TableIndex({
        name: 'plate_country_plate',
        columnNames: ['plate_country', 'plate'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'vehicles',
      new TableForeignKey({
        columnNames: ['vehicle_catalog_id'],
        referencedTableName: 'catalog_vehicles',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('vehicles', 'plate_country_plate');
    await queryRunner.dropTable('vehicles');
  }
}
