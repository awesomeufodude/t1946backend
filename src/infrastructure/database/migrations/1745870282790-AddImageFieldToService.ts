import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImageFieldToService1745870282790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'services',
      new TableColumn({
        name: 'image_url',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('services', 'image_url');
  }
}
