import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitleToPost1701785655989 implements MigrationInterface {
  name = 'AddTitleToPost1701785655989';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_entity" ADD "title" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post_entity" DROP COLUMN "title"`);
  }
}
