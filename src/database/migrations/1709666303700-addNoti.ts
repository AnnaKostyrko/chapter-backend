import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNoti1709666303700 implements MigrationInterface {
    name = 'AddNoti1709666303700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "nota" ("id" SERIAL NOT NULL, "data" json NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b416af9c0ccf8deed7b568b5ae" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "nota"`);
    }

}
