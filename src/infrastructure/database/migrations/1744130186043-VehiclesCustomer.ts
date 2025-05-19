import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class VehiclesCustomer1744130186043 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles_customer',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'vehicle_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'vehicles_customer',
      new TableIndex({
        name: 'IDX_vehicle_customer_unique',
        columnNames: ['vehicle_id', 'customer_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKeys('vehicles_customer', [
      new TableForeignKey({
        columnNames: ['vehicle_id'],
        referencedTableName: 'vehicles',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('vehicles_customer', 'IDX_vehicle_customer_unique');
    await queryRunner.dropTable('vehicles_customer');
  }
}
