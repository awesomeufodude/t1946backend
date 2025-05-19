import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AuditEventType1744130170526 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_event_types',
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
    await queryRunner.dropTable('audit_event_types');
  }
}
