import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AppointmentStatus1744130169519 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'appointment_statuses',
        columns: [
          {
            name: 'code',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('appointment_statuses');
  }
}
