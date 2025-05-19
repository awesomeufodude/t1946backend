import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class BudgetServicesItems1744130187472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'budget_services_items',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'budget_item_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'service_item_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'status_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'assigned_user_id',
            type: 'uuid',
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

    await queryRunner.createForeignKeys('budget_services_items', [
      new TableForeignKey({
        columnNames: ['budget_item_id'],
        referencedTableName: 'budget_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['service_item_id'],
        referencedTableName: 'service_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['status_code'],
        referencedTableName: 'service_items_statuses',
        referencedColumnNames: ['code'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['assigned_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('budget_services_items');
  }
}
