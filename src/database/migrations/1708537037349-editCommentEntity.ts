import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditCommentEntity1708537037349 implements MigrationInterface {
  name = 'EditCommentEntity1708537037349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_entity" ADD "recipientId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" ADD "recipientNickName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity" ALTER COLUMN "updatedAt" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_entity" ALTER COLUMN "updatedAt" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" DROP COLUMN "recipientNickName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" DROP COLUMN "recipientId"`,
    );
  }
}
