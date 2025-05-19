import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class PasscodeCredential1744125891649 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'passcode_credentials',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'passcode_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'store_id',
            type: 'uuid',
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
      }),
    );

    await queryRunner.createForeignKeys('passcode_credentials', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_passcode_credentials_user',
      }),
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_passcode_credentials_store',
      }),
    ]);

    // Índices
    await queryRunner.createIndex(
      'passcode_credentials',
      new TableIndex({
        name: 'passcode_credentials_store_passcode_idx',
        columnNames: ['store_id', 'passcode_hash'],
      }),
    );

    await queryRunner.createIndex(
      'passcode_credentials',
      new TableIndex({
        name: 'passcode_credentials_store_user_id_idx',
        columnNames: ['store_id', 'user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('passcode_credentials', 'passcode_credentials_store_user_id_idx');
    await queryRunner.dropIndex('passcode_credentials', 'passcode_credentials_store_passcode_idx');
    await queryRunner.dropForeignKey('passcode_credentials', 'FK_passcode_credentials_store');
    await queryRunner.dropForeignKey('passcode_credentials', 'FK_passcode_credentials_user');
    await queryRunner.dropTable('passcode_credentials');
  }
}
