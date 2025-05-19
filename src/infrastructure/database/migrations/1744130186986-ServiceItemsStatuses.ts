import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ServiceItemsStatuses1744130186986 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'service_items_statuses',
        columns: [
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isPrimary: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('service_items_statuses');
  }
}
