import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class WorkorderServicesItems1744130187953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workorder_services_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'workorder_item_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'service_item_id',
            type: 'int',
            isNullable: false,
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
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('workorder_services_items', [
      new TableForeignKey({
        columnNames: ['workorder_item_id'],
        referencedTableName: 'workorder_items',
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
    await queryRunner.dropTable('workorder_services_items');
  }
}
