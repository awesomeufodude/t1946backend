import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ServiceItems1744130186512 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'service_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'service_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
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

    await queryRunner.createForeignKey(
      'service_items',
      new TableForeignKey({
        columnNames: ['service_code'],
        referencedTableName: 'services',
        referencedColumnNames: ['code'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('service_items');
  }
}
