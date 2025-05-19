import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Brand1744130171662 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'brands',
        columns: [
          {
            name: 'id',
            type: 'int',
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
            isNullable: true,
          },
          {
            name: 'brand_logo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'has_corporate_agreement',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'corporate_discount',
            type: 'float',
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

    await queryRunner.createTable(
      new Table({
        name: 'brand_business_line',
        columns: [
          {
            name: 'brand_id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'business_line_id',
            type: 'int',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('brand_business_line', [
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['business_line_id'],
        referencedTableName: 'business_lines',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('brand_business_line');
    await queryRunner.dropTable('brands');
  }
}
