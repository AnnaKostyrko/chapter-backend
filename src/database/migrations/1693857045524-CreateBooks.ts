import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBooks1693857045524 implements MigrationInterface {
  name = 'CreateBooks1693857045524';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "book_status" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_417283569406ea2313052af80fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book" ("id" SERIAL NOT NULL, "nameOfBook" character varying NOT NULL, "author" character varying NOT NULL, "annotation" character varying NOT NULL, "book_statusId" integer NOT NULL, "userId" integer, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" ADD CONSTRAINT "FK_04f66cf2a34f8efc5dcd9803693" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" ADD CONSTRAINT "FK_82feb76fc94268c526bbfa99ee5" FOREIGN KEY ("book_statusId") REFERENCES "book_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('book_status')
      .values([
        { id: 1, name: 'finish reading' },
        { id: 2, name: 'reading' },
        { id: 3, name: 'going to read' },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book" DROP CONSTRAINT "FK_82feb76fc94268c526bbfa99ee5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book" DROP CONSTRAINT "FK_04f66cf2a34f8efc5dcd9803693"`,
    );
    await queryRunner.query(`DROP TABLE "book"`);
    await queryRunner.query(`DROP TABLE "book_status"`);
  }
}
