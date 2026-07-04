import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.snapshot.deleteMany();
  await prisma.financialBlueprint.deleteMany();
  await prisma.conversation.deleteMany();

  console.log("All user data cleared successfully.");
  await prisma.$disconnect();
}

main();
