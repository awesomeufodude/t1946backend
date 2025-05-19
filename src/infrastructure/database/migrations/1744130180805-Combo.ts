import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Combo1744130180805 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'combos',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'attribute_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'attribute_value',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
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
    );

    await queryRunner.createIndex(
      'combos',
      new TableIndex({
        name: 'attribute_code_attribute_value',
        columnNames: ['attribute_code', 'attribute_value'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('combos', 'attribute_code_attribute_value');
    await queryRunner.dropTable('combos');
  }
}
