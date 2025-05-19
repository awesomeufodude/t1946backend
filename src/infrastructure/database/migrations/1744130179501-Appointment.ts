import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class Appointment1744130179501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_mode') THEN
            CREATE TYPE "appointment_mode" AS ENUM ('LEAVE', 'WAIT', 'PICKUP');
          END IF;
        END $$;
      `);

    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'budget_id', type: 'varchar', isNullable: false },
          { name: 'mode', type: 'varchar', isNullable: true },
          { name: 'appointment_date', type: 'timestamp', isNullable: true },
          { name: 'status', type: 'varchar', isNullable: false },
          { name: 'need_delivery_return', type: 'boolean', default: false },
          { name: 'has_different_location_delivery', type: 'boolean', default: false },
          { name: 'pickup_address', type: 'varchar', isNullable: true },
          { name: 'pickup_address_number', type: 'varchar', isNullable: true },
          { name: 'pickup_address_comment', type: 'varchar', isNullable: true },
          { name: 'pickup_address_latitude', type: 'decimal', precision: 10, scale: 6, isNullable: true },
          { name: 'pickup_address_longitude', type: 'decimal', precision: 10, scale: 6, isNullable: true },
          { name: 'delivery_address', type: 'varchar', isNullable: true },
          { name: 'delivery_address_number', type: 'varchar', isNullable: true },
          { name: 'delivery_address_comment', type: 'varchar', isNullable: true },
          { name: 'delivery_address_latitude', type: 'decimal', precision: 10, scale: 6, isNullable: true },
          { name: 'delivery_address_longitude', type: 'decimal', precision: 10, scale: 6, isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'appointments_budget_id_idx',
        columnNames: ['budget_id'],
      }),
    );

    await queryRunner.createForeignKeys('appointments', [
      new TableForeignKey({
        columnNames: ['budget_id'],
        referencedTableName: 'budgets',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['status'],
        referencedTableName: 'appointment_statuses',
        referencedColumnNames: ['code'],
        onDelete: 'SET NULL',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('appointments', 'appointments_budget_id_idx');
    await queryRunner.dropTable('appointments');
    await queryRunner.query(`DROP TYPE IF EXISTS "appointment_mode"`);
  }
}
