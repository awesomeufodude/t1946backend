import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class LaborTime1744130183657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'labor_times',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'store_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'business_line_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'time',
            type: 'varchar',
            default: `'01:45'`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('labor_times');
  }
}
