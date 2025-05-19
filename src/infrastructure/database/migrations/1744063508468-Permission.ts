import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Permission1744063508468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'code',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'module_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'permissions',
      new TableForeignKey({
        columnNames: ['module_code'],
        referencedTableName: 'modules',
        referencedColumnNames: ['code'],
        onDelete: 'SET NULL',
        name: 'FK_permissions_module',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('permissions', 'FK_permissions_module');
    await queryRunner.dropTable('permissions');
  }
}
