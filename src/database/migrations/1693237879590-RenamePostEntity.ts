import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePostEntity1693237879590 implements MigrationInterface {
    name = 'RenamePostEntity1693237879590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_entity" ("id" SERIAL NOT NULL, "imgUrl" character varying, "caption" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer NOT NULL, CONSTRAINT "PK_58a149c4e88bf49036bc4c8c79f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "post_entity" ADD CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_entity" DROP CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8"`);
        await queryRunner.query(`DROP TABLE "post_entity"`);
    }

}
