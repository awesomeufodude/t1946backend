import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonToCustomerTypeEnum1745876920612 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TYPE "customers_customer_type_enum"
          ADD VALUE IF NOT EXISTS 'PERSON';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customers_customer_type_enum') THEN
              CREATE TYPE "customers_customer_type_enum_tmp" AS ENUM ('PEOPLE', 'COMPANY');
    
              ALTER TABLE "customers"
              ALTER COLUMN "customer_type" TYPE "customers_customer_type_enum_tmp"
              USING customer_type::text::customers_customer_type_enum_tmp;
    
              DROP TYPE "customers_customer_type_enum";
    
              ALTER TYPE "customers_customer_type_enum_tmp"
              RENAME TO "customers_customer_type_enum";
            END IF;
          END $$;
        `);
  }
}
