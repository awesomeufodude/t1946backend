import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class BudgetStatus1744130179497 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'budgets_statuses',
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
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('budgets_statuses');
  }
}
