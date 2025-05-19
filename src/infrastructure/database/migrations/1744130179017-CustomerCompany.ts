import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CustomerCompany1744130179017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customers_company',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'rut',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'legal_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'office_address',
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
            name: 'phone_zone',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'contact_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'contact_lastname',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'contact_email',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'contact_phone_zone',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'contact_phone_number',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'company_business_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'business_activity',
            type: 'varchar',
            isNullable: false,
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
      'customers_company',
      new TableIndex({
        name: 'customers_company_email_idx',
        columnNames: ['contact_email'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKeys('customers_company', [
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_customers_company_customer',
      }),
      new TableForeignKey({
        columnNames: ['company_business_id'],
        referencedTableName: 'company_business',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_customers_company_business',
      }),
      new TableForeignKey({
        columnNames: ['customer_category_id'],
        referencedTableName: 'customer_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_customers_company_category',
      }),
      new TableForeignKey({
        columnNames: ['consultation_channel_id'],
        referencedTableName: 'consultation_channels',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_customers_company_channel',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('customers_company', 'customers_company_email_idx');
    await queryRunner.dropForeignKey('customers_company', 'FK_customers_company_customer');
    await queryRunner.dropForeignKey('customers_company', 'FK_customers_company_business');
    await queryRunner.dropForeignKey('customers_company', 'FK_customers_company_category');
    await queryRunner.dropForeignKey('customers_company', 'FK_customers_company_channel');
    await queryRunner.dropTable('customers_company');
  }
}
