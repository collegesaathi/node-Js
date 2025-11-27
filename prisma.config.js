const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    adapter: "@prisma/adapter-pg", // PostgreSQL adapter
    url: process.env.DATABASE_URL,
  },
});
