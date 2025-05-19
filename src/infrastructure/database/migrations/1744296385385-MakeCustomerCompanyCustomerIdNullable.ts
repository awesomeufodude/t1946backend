import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class MakeCustomerCompanyCustomerIdNullable1744296385385 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('customers_company', 'FK_customers_company_customer');

    await queryRunner.changeColumn(
      'customers_company',
      'customer_id',
      new TableColumn({
        name: 'customer_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'customers_company',
      new TableForeignKey({
        name: 'FK_customers_company_customer',
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('customers_company', 'FK_customers_company_customer');

    await queryRunner.changeColumn(
      'customers_company',
      'customer_id',
      new TableColumn({
        name: 'customer_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'customers_company',
      new TableForeignKey({
        name: 'FK_customers_company_customer',
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }
}
