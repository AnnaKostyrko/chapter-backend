import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNickname1693485656286 implements MigrationInterface {
    name = 'AddNickname1693485656286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "nickName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nickName"`);
    }

}
