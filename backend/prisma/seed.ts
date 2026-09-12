import { prisma } from "../src/lib/prisma.ts";

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
