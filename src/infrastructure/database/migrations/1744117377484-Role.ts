import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Role1744117377484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'roles_permissions',
        columns: [
          {
            name: 'roles_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'permissions_code',
            type: 'varchar',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('roles_permissions', [
      new TableForeignKey({
        columnNames: ['roles_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_roles_permissions_role',
      }),
      new TableForeignKey({
        columnNames: ['permissions_code'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['code'],
        onDelete: 'CASCADE',
        name: 'FK_roles_permissions_permission',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('roles_permissions', 'FK_roles_permissions_permission');
    await queryRunner.dropForeignKey('roles_permissions', 'FK_roles_permissions_role');
    await queryRunner.dropTable('roles_permissions');
    await queryRunner.dropTable('roles');
  }
}
