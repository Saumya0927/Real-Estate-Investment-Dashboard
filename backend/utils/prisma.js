const { PrismaClient } = require('@prisma/client');

let prisma;


if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./dev.db'
        }
      }
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;