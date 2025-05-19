import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class SystemParameter1744130181159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_parameters_parameter_type_enum') THEN
            CREATE TYPE "system_parameters_parameter_type_enum" AS ENUM ('ALPHA', 'NUMERIC', 'CHECK');
          END IF;
        END $$;
      `);

    await queryRunner.createTable(
      new Table({
        name: 'system_parameters',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'parameter_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'parameter_value',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'parameter_type',
            type: 'system_parameters_parameter_type_enum',
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
      'system_parameters',
      new TableIndex({
        name: 'system_parameters_parameter_name_idx',
        columnNames: ['parameter_name'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('system_parameters', 'system_parameters_parameter_name_idx');
    await queryRunner.dropTable('system_parameters');
    await queryRunner.query(`DROP TYPE "system_parameters_parameter_type_enum"`);
  }
}
