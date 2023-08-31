import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropNickName1693484753118 implements MigrationInterface {
  name = 'DropNickName1693484753118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e2364281027b926b879fa2fa1e"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nickName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nickname"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "nickname" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "nickName" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e2364281027b926b879fa2fa1e" ON "user" ("nickname") `,
    );
  }
}
