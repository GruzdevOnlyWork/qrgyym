import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.exerciseMuscles.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.muscle.deleteMany();
  await prisma.difficulty.deleteMany();

  const easy = await prisma.difficulty.create({ data: { name: "Легкий", description: "Подходит для новичков" } });
  const medium = await prisma.difficulty.create({ data: { name: "Средний", description: "Средний уровень" } });
  const hard = await prisma.difficulty.create({ data: { name: "Сложный", description: "Продвинутый уровень" } });

  const biceps = await prisma.muscle.create({ data: { name: "Бицепс" } });
  const triceps = await prisma.muscle.create({ data: { name: "Трицепс" } });
  const chest = await prisma.muscle.create({ data: { name: "Грудные мышцы" } });

  const treadmill = await prisma.equipment.create({
    data: {
      name: "Беговая дорожка",
      description: "Для кардиотренировок",
      category: "Кардио",
      qrCodeUrl: "http://example.com/equipment/treadmill"
    },
  });

  // Создаем упражнение и связываем с мышцами через вложенный create
  await prisma.exercise.create({
    data: {
      name: "Сгибание рук на бицепс",
      description: "Упражнение для укрепления бицепса",
      instructions: ["Встаньте прямо", "Возьмите гантели", "Сгибайте руки в локтях"],
      tips: ["Держите локти прижатыми к туловищу", "Делайте упражнение медленно"],
      difficultyId: easy.id,
      imageUrl: "http://example.com/exercise/biceps_curl.jpg",
      equipmentId: treadmill.id,

      muscles: {
        create: [
          {
            muscle: {
              connect: { id: biceps.id },
            }
          }
        ]
      }
    }
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
