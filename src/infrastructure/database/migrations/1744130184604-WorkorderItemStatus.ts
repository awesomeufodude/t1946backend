import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class WorkorderItemStatus1744130184604 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workorder_item_statuses',
        columns: [
          {
            name: 'code',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workorder_item_statuses');
  }
}
