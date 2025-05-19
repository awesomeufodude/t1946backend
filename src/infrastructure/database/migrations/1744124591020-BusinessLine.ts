import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class BusinessLine1744124591020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'business_lines',
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
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'boolean',
            isNullable: false,
            default: 'false',
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('business_lines');
  }
}
