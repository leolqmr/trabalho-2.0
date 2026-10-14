import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar uma Turma de teste
  const turma = await prisma.turma.create({
    data: {
      name: 'Engenharia de Software - 2026.1',
    },
  });

  // 2. Criar uma Aula vinculada à Turma
  const aula = await prisma.aula.create({
    data: {
      date: new Date(),
      turma_id: turma.id,
    },
  });

  console.log('Seed de Turma e Aula concluído com sucesso!');
  console.log(`Turma ID: ${turma.id}`);
  console.log(`Aula ID: ${aula.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });