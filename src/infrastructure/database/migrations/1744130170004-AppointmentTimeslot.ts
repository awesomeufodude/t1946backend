import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AppointmentTimeslot1744130170004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'appointment_timeslots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'store_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'business_line_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'mode',
            type: 'enum',
            enum: ['LEAVE', 'WAIT', 'PICKUP'],
          },
          {
            name: 'date',
            type: 'timestamp',
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'slots',
            type: 'int',
          },
          {
            name: 'slots_used',
            type: 'int',
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
    );

    await queryRunner.createForeignKey(
      'appointment_timeslots',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_appointment_timeslot_store',
      }),
    );

    await queryRunner.createForeignKey(
      'appointment_timeslots',
      new TableForeignKey({
        columnNames: ['business_line_id'],
        referencedTableName: 'business_lines',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_appointment_timeslot_business_line',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('appointment_timeslots', 'FK_appointment_timeslot_business_line');
    await queryRunner.dropForeignKey('appointment_timeslots', 'FK_appointment_timeslot_store');
    await queryRunner.dropTable('appointment_timeslots');
  }
}
