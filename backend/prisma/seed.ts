import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const frontend = await prisma.skill.create({ data: { name: "Frontend" } });
  const backend = await prisma.skill.create({ data: { name: "Backend" } });

  await prisma.developer.create({
    data: {
      name: "Alice",
      skills: {
        create: [{ skill: { connect: { id: frontend.id } } }],
      },
    },
  });
  await prisma.developer.create({
    data: {
      name: "Bob",
      skills: {
        create: [{ skill: { connect: { id: backend.id } } }],
      },
    },
  });
  await prisma.developer.create({
    data: {
      name: "Carol",
      skills: {
        create: [
          { skill: { connect: { id: frontend.id } } },
          { skill: { connect: { id: backend.id } } },
        ],
      },
    },
  });
  await prisma.developer.create({
    data: {
      name: "Dave",
      skills: {
        create: [{ skill: { connect: { id: backend.id } } }],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
