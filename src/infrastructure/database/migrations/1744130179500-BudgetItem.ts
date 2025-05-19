import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class BudgetItem1744130179500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'budget_items',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'budget_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'item_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'item_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'unit_price',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_checked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'item_combo_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'business_line_id',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'budget_items',
      new TableIndex({
        name: 'budget_items_budget_id_idx',
        columnNames: ['budget_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'budget_items',
      new TableForeignKey({
        columnNames: ['budget_id'],
        referencedTableName: 'budgets',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'fk_budget_items_budget',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('budget_items', 'budget_items_budget_id_idx');
    await queryRunner.dropForeignKey('budget_items', 'fk_budget_items_budget');
    await queryRunner.dropTable('budget_items');
  }
}
