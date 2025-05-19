import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Customer1744130176989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customers_customer_type_enum') THEN
            CREATE TYPE "customers_customer_type_enum" AS ENUM ('PEOPLE', 'COMPANY');
          END IF;
        END $$;
      `);

    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'customer_type',
            type: 'customers_customer_type_enum',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'customers_document_type_idx',
        columnNames: ['customer_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('customers', 'customers_document_type_idx');
    await queryRunner.dropTable('customers');
    await queryRunner.query(`DROP TYPE IF EXISTS "customers_customer_type_enum"`);
  }
}
