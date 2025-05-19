import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddServiceItemToNotes1744299412496 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'notes',
      new TableColumn({
        name: 'workorder_service_item_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'notes',
      new TableForeignKey({
        columnNames: ['workorder_service_item_id'],
        referencedTableName: 'workorder_services_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.addColumn(
      'notes',
      new TableColumn({
        name: 'budget_service_item_id',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'notes',
      new TableForeignKey({
        columnNames: ['budget_service_item_id'],
        referencedTableName: 'budget_services_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('notes');

    const fkBudget = table.foreignKeys.find((fk) => fk.columnNames.includes('budget_service_item_id'));
    if (fkBudget) {
      await queryRunner.dropForeignKey('notes', fkBudget);
    }
    await queryRunner.dropColumn('notes', 'budget_service_item_id');

    const fkWorkorder = table.foreignKeys.find((fk) => fk.columnNames.includes('workorder_service_item_id'));
    if (fkWorkorder) {
      await queryRunner.dropForeignKey('notes', fkWorkorder);
    }
    await queryRunner.dropColumn('notes', 'workorder_service_item_id');
  }
}
