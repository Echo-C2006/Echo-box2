import { PrismaClient } from "@prisma/client";
import { defaultCompetitions } from "../src/lib/competitions";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  for (const comp of defaultCompetitions) {
    await prisma.competition.upsert({
      where: { name: comp.name },
      update: {},
      create: comp,
    });
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
