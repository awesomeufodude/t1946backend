import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class WorkorderItemRecord1744130185560 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workorder_item_records',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'workorder_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'workorder_item_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'user_assigned',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('workorder_item_records', [
      new TableForeignKey({
        columnNames: ['workorder_id'],
        referencedTableName: 'workorders',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['workorder_item_id'],
        referencedTableName: 'workorder_items',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['user_assigned'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workorder_item_records');
  }
}
