-- CreateTable
CREATE TABLE "alunos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "turma_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_turma_id_email_key" ON "alunos"("turma_id", "email");

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Presenças registradas por e-mail passam a apontar para um aluno da turma.
ALTER TABLE "presencas" ADD COLUMN "aluno_id" UUID;

-- Backfill: cria um aluno (nome = e-mail) para cada e-mail já usado em chamadas de uma turma.
INSERT INTO "alunos" ("name", "email", "turma_id")
SELECT p."email", p."email", a."turma_id"
FROM "presencas" p
JOIN "aulas" a ON a."id" = p."aula_id"
WHERE p."email" IS NOT NULL
GROUP BY a."turma_id", p."email";

UPDATE "presencas" p
SET "aluno_id" = al."id"
FROM "aulas" a, "alunos" al
WHERE a."id" = p."aula_id"
  AND al."turma_id" = a."turma_id"
  AND al."email" = p."email";

-- Registros antigos sem e-mail (só user_id) não têm como virar aluno: são removidos.
DELETE FROM "presencas" WHERE "aluno_id" IS NULL;

-- AlterTable
ALTER TABLE "presencas" ALTER COLUMN "aluno_id" SET NOT NULL;

-- DropIndex
DROP INDEX "presencas_user_id_idx";

-- DropIndex
DROP INDEX "presencas_email_idx";

-- AlterTable
ALTER TABLE "presencas" DROP COLUMN "user_id", DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "presencas_aula_id_aluno_id_key" ON "presencas"("aula_id", "aluno_id");

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
