import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditBookEntity1706208867350 implements MigrationInterface {
  name = 'EditBookEntity1706208867350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book" ALTER COLUMN "author" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" ALTER COLUMN "annotation" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book" ALTER COLUMN "annotation" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" ALTER COLUMN "author" SET NOT NULL`,
    );
  }
}
