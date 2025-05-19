import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AuditLog1744130170527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'event_type_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'audit_logs_user_id_idx',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'audit_logs_event_type_code_idx',
        columnNames: ['event_type_code'],
      }),
    );

    await queryRunner.createForeignKeys('audit_logs', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        name: 'FK_audit_logs_user',
      }),
      new TableForeignKey({
        columnNames: ['event_type_code'],
        referencedTableName: 'audit_event_types',
        referencedColumnNames: ['code'],
        onDelete: 'NO ACTION',
        name: 'FK_audit_logs_event_type',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('audit_logs', 'FK_audit_logs_event_type');
    await queryRunner.dropForeignKey('audit_logs', 'FK_audit_logs_user');
    await queryRunner.dropIndex('audit_logs', 'audit_logs_event_type_code_idx');
    await queryRunner.dropIndex('audit_logs', 'audit_logs_user_id_idx');
    await queryRunner.dropTable('audit_logs');
  }
}
