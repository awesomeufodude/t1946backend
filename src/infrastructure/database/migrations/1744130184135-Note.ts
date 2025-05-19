import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Note1744130184135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'workorder_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'budget_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'step',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_by',
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
      true,
    );

    await queryRunner.createForeignKeys('notes', [
      new TableForeignKey({
        columnNames: ['workorder_id'],
        referencedTableName: 'workorders',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['budget_id'],
        referencedTableName: 'budgets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notes');
  }
}
