-- Cada aula possui no máximo uma janela de chamada por código.
-- O código é armazenado apenas como hash SHA-256 com salt aleatório.
CREATE TABLE "chamadas_codigo" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "aula_id" UUID NOT NULL,
  "codigoHash" TEXT NOT NULL,
  "salt" TEXT NOT NULL,
  "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "encerradoEm" TIMESTAMP(3),
  CONSTRAINT "chamadas_codigo_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "chamadas_codigo_aula_id_key" ON "chamadas_codigo"("aula_id");
ALTER TABLE "chamadas_codigo" ADD CONSTRAINT "chamadas_codigo_aula_id_fkey"
  FOREIGN KEY ("aula_id") REFERENCES "aulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Contador persistido por aluno/janela, independentemente de processos/instâncias da API.
CREATE TABLE "chamadas_codigo_tentativas" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "chamada_id" UUID NOT NULL,
  "aluno_id" UUID NOT NULL,
  "total" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "chamadas_codigo_tentativas_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "chamadas_codigo_tentativas_chamada_id_aluno_id_key"
  ON "chamadas_codigo_tentativas"("chamada_id", "aluno_id");
ALTER TABLE "chamadas_codigo_tentativas" ADD CONSTRAINT "chamadas_codigo_tentativas_chamada_id_fkey"
  FOREIGN KEY ("chamada_id") REFERENCES "chamadas_codigo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chamadas_codigo_tentativas" ADD CONSTRAINT "chamadas_codigo_tentativas_aluno_id_fkey"
  FOREIGN KEY ("aluno_id") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
