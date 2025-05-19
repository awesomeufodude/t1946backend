import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class NoteFile1744317020912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'note_files',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'note_id',
            type: 'uuid',
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
        checks: [
          {
            expression: `"type" IN ('image', 'video')`,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'note_files',
      new TableForeignKey({
        columnNames: ['note_id'],
        referencedTableName: 'notes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('note_files');
  }
}
