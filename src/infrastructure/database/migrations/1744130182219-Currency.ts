import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Currency1744130182219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'currencies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'decimals',
            type: 'int',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('currencies');
  }
}
