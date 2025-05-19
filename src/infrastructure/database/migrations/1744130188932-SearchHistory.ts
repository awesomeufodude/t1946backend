import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class SearchHistory1744130188932 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'search_history',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'budget_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'work_order_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'double_plp',
            type: 'boolean',
            default: false,
          },
          {
            name: 'front_profile',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'front_width',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'front_rim',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'rear_profile',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'rear_width',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'rear_rim',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'search_criteria_id',
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

    await queryRunner.createForeignKeys('search_history', [
      new TableForeignKey({
        columnNames: ['budget_id'],
        referencedTableName: 'budgets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['work_order_id'],
        referencedTableName: 'workorders',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['search_criteria_id'],
        referencedTableName: 'search_criteria',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('search_history');
  }
}
