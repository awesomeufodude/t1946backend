import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ComboItemPrice1744130180807 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'combo_items_prices',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'combo_item_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'store_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'price_store',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price_web',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'price_tmk',
            type: 'int',
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

    await queryRunner.createForeignKey(
      'combo_items_prices',
      new TableForeignKey({
        columnNames: ['combo_item_id'],
        referencedTableName: 'combo_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_combo_items_prices_combo_item',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('combo_items_prices', 'FK_combo_items_prices_combo_item');
    await queryRunner.dropTable('combo_items_prices');
  }
}
