import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserToUser1693813178241 implements MigrationInterface {
  name = 'CreateUserToUser1693813178241';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `CREATE TABLE "User2user(friends)" ("userId_1" integer NOT NULL, "userId_2" integer NOT NULL, CONSTRAINT "PK_a93c8b8e565837e431596b4e23b" PRIMARY KEY ("userId_1", "userId_2"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9e7c1431e31097937d0aa3626" ON "User2user(friends)" ("userId_1") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d9845b03d7e4378df1c7e072dc" ON "User2user(friends)" ("userId_2") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "User2user(friends)" ADD CONSTRAINT "FK_d9e7c1431e31097937d0aa36261" FOREIGN KEY ("userId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "User2user(friends)" ADD CONSTRAINT "FK_d9845b03d7e4378df1c7e072dc1" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "User2user(friends)" DROP CONSTRAINT "FK_d9845b03d7e4378df1c7e072dc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User2user(friends)" DROP CONSTRAINT "FK_d9e7c1431e31097937d0aa36261"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9845b03d7e4378df1c7e072dc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d9e7c1431e31097937d0aa3626"`,
    );
    await queryRunner.query(`DROP TABLE "User2user(friends)"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
