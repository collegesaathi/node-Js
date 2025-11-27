const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "Super Admin" },
    { name: "Admin" },
    { name: "Employee" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("Seeded roles successfully!");
}

module.exports = main; // <-- export the function
