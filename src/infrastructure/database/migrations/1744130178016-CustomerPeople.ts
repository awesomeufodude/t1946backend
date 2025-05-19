import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CustomerPeople1744130178016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DO $$ BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customers_people_document_type_enum') THEN
                CREATE TYPE "customers_people_document_type_enum" AS ENUM ('RUT', 'DNI', 'PASSPORT');
              END IF;
            END $$;
          `);

    await queryRunner.createTable(
      new Table({
        name: 'customers_people',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'document_type',
            type: 'customers_people_document_type_enum',
            isNullable: false,
          },
          {
            name: 'document_id',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
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
            isUnique: true,
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
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'addres_comment',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address_latitude',
            type: 'decimal',
            precision: 10,
            scale: 6,
            isNullable: true,
          },
          {
            name: 'address_longitude',
            type: 'decimal',
            precision: 10,
            scale: 6,
            isNullable: true,
          },
          {
            name: 'customer_category_id',
            type: 'int',
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

    await queryRunner.createIndex(
      'customers_people',
      new TableIndex({
        name: 'customers_people_customer_document_type_id_idx',
        columnNames: ['document_type', 'document_id'],
      }),
    );

    await queryRunner.createIndex(
      'customers_people',
      new TableIndex({
        name: 'customers_people_email_idx',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKeys('customers_people', [
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_customers_people_customer',
      }),
      new TableForeignKey({
        columnNames: ['customer_category_id'],
        referencedTableName: 'customer_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_customers_people_category',
      }),
      new TableForeignKey({
        columnNames: ['consultation_channel_id'],
        referencedTableName: 'consultation_channels',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_customers_people_channel',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('customers_people', 'FK_customers_people_customer');
    await queryRunner.dropForeignKey('customers_people', 'FK_customers_people_category');
    await queryRunner.dropForeignKey('customers_people', 'FK_customers_people_channel');
    await queryRunner.dropIndex('customers_people', 'customers_people_customer_document_type_id_idx');
    await queryRunner.dropIndex('customers_people', 'customers_people_email_idx');
    await queryRunner.dropTable('customers_people');
  }
}
