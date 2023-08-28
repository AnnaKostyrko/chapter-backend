import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteAuthorId1693240599305 implements MigrationInterface {
    name = 'DeleteAuthorId1693240599305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_entity" DROP CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8"`);
        await queryRunner.query(`ALTER TABLE "post_entity" ALTER COLUMN "authorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_entity" ADD CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_entity" DROP CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8"`);
        await queryRunner.query(`ALTER TABLE "post_entity" ALTER COLUMN "authorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "post_entity" ADD CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
