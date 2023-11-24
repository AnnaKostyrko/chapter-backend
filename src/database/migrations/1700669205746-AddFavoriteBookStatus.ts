import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavoriteBookStatus1700669205746 implements MigrationInterface {
    name = 'AddFavoriteBookStatus1700669205746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" ADD "favorite_book_status" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "favorite_book_status"`);
    }

}
