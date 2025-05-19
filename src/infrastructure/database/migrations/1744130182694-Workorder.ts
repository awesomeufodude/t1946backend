import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const DELIVERY_MODE_ENUM: string[] = ['LEAVE', 'WAIT'];

export class Workorder1744130182694 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workorders',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'channel_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'store_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'vehicle_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'budget_id',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'consultation_channel_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'odometer',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'sub_total',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'discount',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'iva',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'total',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'currency_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'delivery_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'delivery_mode',
            type: 'enum',
            enumName: 'delivery_mode_type',
            enum: DELIVERY_MODE_ENUM,
            isNullable: true,
          },
          {
            name: 'reassigned',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'reassigned_to',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status_code',
            type: 'varchar',
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

    await queryRunner.createIndices('workorders', [
      new TableIndex({
        name: 'workorders_created_by_idx',
        columnNames: ['created_by'],
      }),
      new TableIndex({
        name: 'workorders_budget_id_idx',
        columnNames: ['budget_id'],
      }),
      new TableIndex({
        name: 'workorders_store_created_by_idx',
        columnNames: ['store_id', 'created_by'],
      }),
      new TableIndex({
        name: 'workorders_store_reassigned_to_idx',
        columnNames: ['store_id', 'reassigned_to'],
      }),
    ]);

    await queryRunner.createForeignKeys('workorders', [
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['channel_id'],
        referencedTableName: 'channels',
        referencedColumnNames: ['code'],
      }),
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['vehicle_id'],
        referencedTableName: 'vehicles',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['budget_id'],
        referencedTableName: 'budgets',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['consultation_channel_id'],
        referencedTableName: 'consultation_channels',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['currency_id'],
        referencedTableName: 'currencies',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['reassigned_to'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['status_code'],
        referencedTableName: 'workorder_statuses',
        referencedColumnNames: ['code'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workorders');
  }
}
