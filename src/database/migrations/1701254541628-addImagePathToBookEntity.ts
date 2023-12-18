import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagePathToBookEntity1701254541628
  implements MigrationInterface
{
  name = 'AddImagePathToBookEntity1701254541628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book" ADD "imagePath" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "imagePath"`);
  }
}
