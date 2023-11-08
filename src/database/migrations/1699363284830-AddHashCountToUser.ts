import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHashCountToUser1699363284830 implements MigrationInterface {
  name = 'AddHashCountToUser1699363284830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "hashCount" integer DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashCount"`);
  }
}
