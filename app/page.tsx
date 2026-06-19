import { prisma } from "../prisma/prisma-client";
import MainContent from "../components/MainContent";

export const revalidate = 0;

async function getEquipmentData() {
  return prisma.equipment.findMany({
    include: { exercises: { include: { difficulty: true } } },
  });
}

export default async function HomePage() {
  const equipmentData = await getEquipmentData();

  return <MainContent equipmentData={equipmentData} />;
}