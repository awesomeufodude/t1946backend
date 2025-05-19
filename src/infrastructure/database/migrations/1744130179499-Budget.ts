import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class Budget1744130179499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'budgets',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'budget_group_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'sub_total',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'iva',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'total',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'sent',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'status_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sent_at',
            type: 'timestamp',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'budgets',
      new TableIndex({
        name: 'budgets_budget_group_idx',
        columnNames: ['budget_group_id'],
      }),
    );

    await queryRunner.createForeignKeys('budgets', [
      new TableForeignKey({
        columnNames: ['budget_group_id'],
        referencedTableName: 'budget_groups',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['status_code'],
        referencedTableName: 'budgets_statuses',
        referencedColumnNames: ['code'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('budgets', 'budgets_budget_group_idx');
    await queryRunner.dropTable('budgets');
  }
}
