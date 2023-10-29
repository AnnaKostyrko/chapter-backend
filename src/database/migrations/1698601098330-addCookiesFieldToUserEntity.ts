import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCookiesFieldToUserEntity1698601098330
  implements MigrationInterface
{
  name = 'AddCookiesFieldToUserEntity1698601098330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "IsAccessCookie" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "IsAccessCookie"`);
  }
}
