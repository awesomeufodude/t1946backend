import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ServicePrice1744130180804 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'service_prices',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'service_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'store_id',
            type: 'varchar',
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

    await queryRunner.createForeignKey(
      'service_prices',
      new TableForeignKey({
        columnNames: ['service_code'],
        referencedTableName: 'services',
        referencedColumnNames: ['code'],
        onDelete: 'CASCADE',
        name: 'FK_service_prices_service',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('service_prices', 'FK_service_prices_service');
    await queryRunner.dropTable('service_prices');
  }
}
