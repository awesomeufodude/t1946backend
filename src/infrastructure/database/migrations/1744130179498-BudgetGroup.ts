import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class BudgetGroup1744130179498 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'budget_groups',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'channel_code', type: 'varchar', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'store_id', type: 'uuid', isNullable: true },
          { name: 'customer_id', type: 'uuid', isNullable: true },
          { name: 'lead_id', type: 'uuid', isNullable: true },
          { name: 'vehicle_id', type: 'uuid', isNullable: true },
          { name: 'consultation_channel_id', type: 'uuid', isNullable: true },
          { name: 'sent', type: 'boolean', isNullable: false },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'extended', type: 'boolean', default: false, isNullable: true },
          { name: 'deleted', type: 'boolean', default: false, isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'budget_groups',
      new TableIndex({
        name: 'budget_groups_created_by_idx',
        columnNames: ['created_by'],
      }),
    );

    await queryRunner.createIndex(
      'budget_groups',
      new TableIndex({
        name: 'budget_groups_created_by_store_idx',
        columnNames: ['created_by', 'store_id'],
      }),
    );

    await queryRunner.createForeignKeys('budget_groups', [
      new TableForeignKey({
        columnNames: ['channel_code'],
        referencedTableName: 'channels',
        referencedColumnNames: ['code'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['lead_id'],
        referencedTableName: 'leads',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['vehicle_id'],
        referencedTableName: 'vehicles',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['consultation_channel_id'],
        referencedTableName: 'consultation_channels',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('budget_groups', 'budget_groups_created_by_idx');
    await queryRunner.dropIndex('budget_groups', 'budget_groups_created_by_store_idx');
    await queryRunner.dropTable('budget_groups');
  }
}
