import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class WorkorderItem1744130184605 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workorder_items',
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
            name: 'unit_price',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'unit_discounted_price',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'discount_approved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'promotion_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'item_combo_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'user_assigned',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'item_status',
            type: 'varchar',
            isNullable: false,
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
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('workorder_items', [
      new TableForeignKey({
        columnNames: ['workorder_id'],
        referencedTableName: 'workorders',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['discount_approved_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['user_assigned'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['item_status'],
        referencedTableName: 'workorder_item_statuses',
        referencedColumnNames: ['code'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workorder_items');
  }
}
