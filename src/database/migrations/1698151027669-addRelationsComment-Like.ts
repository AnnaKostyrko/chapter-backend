import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationsCommentLike1698151027669
  implements MigrationInterface
{
  name = 'AddRelationsCommentLike1698151027669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_e32499a4d3ab99d23605712c7ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" RENAME COLUMN "comment" TO "commentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a" FOREIGN KEY ("commentId") REFERENCES "comment_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" RENAME COLUMN "commentId" TO "comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_e32499a4d3ab99d23605712c7ba" FOREIGN KEY ("comment") REFERENCES "comment_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
