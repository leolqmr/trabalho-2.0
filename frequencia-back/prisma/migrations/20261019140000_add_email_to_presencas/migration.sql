-- AlterTable
ALTER TABLE "presencas" ADD COLUMN "email" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "presencas_email_idx" ON "presencas"("email");
