import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Service1744130180803 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'services',
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
          {
            name: 'subcategory_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'apply_to_car',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'fixed_quantity',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'explanation_title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'explanation_description',
            type: 'varchar',
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
          },
          {
            name: 'sort_order',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'business_line_id',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'services',
      new TableForeignKey({
        columnNames: ['business_line_id'],
        referencedTableName: 'business_lines',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_services_business_line',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('services', 'FK_services_business_line');
    await queryRunner.dropTable('services');
  }
}
