import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ComboItem1744130180806 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'combo_items',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'combo_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'service_code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'is_optional',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'is_recommended',
            type: 'boolean',
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

    await queryRunner.createForeignKeys('combo_items', [
      new TableForeignKey({
        columnNames: ['combo_id'],
        referencedTableName: 'combos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_combo_items_combo',
      }),
      new TableForeignKey({
        columnNames: ['service_code'],
        referencedTableName: 'services',
        referencedColumnNames: ['code'],
        onDelete: 'CASCADE',
        name: 'FK_combo_items_service',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('combo_items', 'FK_combo_items_combo');
    await queryRunner.dropForeignKey('combo_items', 'FK_combo_items_service');
    await queryRunner.dropTable('combo_items');
  }
}
