import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class User1744124624973 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'rut',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'lastname',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'avatar_path',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'job_role',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'phone_zone',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'phone_number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'security_method_totem',
            type: 'varchar',
            isNullable: false,
            default: `'CODE'`,
          },
          {
            name: 'active',
            type: 'boolean',
            isNullable: false,
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
        uniques: [
          new TableUnique({
            name: 'UQ_users_rut',
            columnNames: ['rut'],
          }),
          new TableUnique({
            name: 'UQ_users_email',
            columnNames: ['email'],
          }),
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_users_role',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_stores',
        columns: [
          {
            name: 'user_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'store_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('user_stores', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_user_stores_user',
      }),
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_user_stores_store',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('user_stores', 'FK_user_stores_store');
    await queryRunner.dropForeignKey('user_stores', 'FK_user_stores_user');
    await queryRunner.dropTable('user_stores');

    await queryRunner.dropForeignKey('users', 'FK_users_role');
    await queryRunner.dropTable('users');
  }
}
