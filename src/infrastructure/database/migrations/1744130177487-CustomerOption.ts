import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CustomerOption1744130177487 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customer_options',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'send_promotions',
            type: 'boolean',
            isNullable: false,
            default: 'false',
          },
          {
            name: 'send_newsletters',
            type: 'boolean',
            isNullable: false,
            default: 'false',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'customer_options',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_customer_options_customer',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('customer_options', 'FK_customer_options_customer');
    await queryRunner.dropTable('customer_options');
  }
}
