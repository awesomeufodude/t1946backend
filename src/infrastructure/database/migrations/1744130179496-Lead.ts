import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Lead1744130179496 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'leads',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastname',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'second_lastname',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone_zone',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'consultation_channel_id',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'leads',
      new TableForeignKey({
        columnNames: ['consultation_channel_id'],
        referencedTableName: 'consultation_channels',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_leads_consultation_channel',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('leads', 'FK_leads_consultation_channel');
    await queryRunner.dropTable('leads');
  }
}
