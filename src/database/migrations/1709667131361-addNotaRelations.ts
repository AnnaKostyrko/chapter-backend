import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotaRelations1709667131361 implements MigrationInterface {
    name = 'AddNotaRelations1709667131361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nota" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "nota" ADD CONSTRAINT "FK_fc61a51d0cb634428de2993244f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nota" DROP CONSTRAINT "FK_fc61a51d0cb634428de2993244f"`);
        await queryRunner.query(`ALTER TABLE "nota" DROP COLUMN "userId"`);
    }

}
