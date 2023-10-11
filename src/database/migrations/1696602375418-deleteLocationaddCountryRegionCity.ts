import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteLocationaddCountryRegionCity1696602375418
  implements MigrationInterface
{
  name = 'DeleteLocationaddCountryRegionCity1696602375418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "country" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "region" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "city" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "region"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "location" character varying`,
    );
  }
}
