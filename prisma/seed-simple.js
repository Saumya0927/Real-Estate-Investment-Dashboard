const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      phoneNumber: '+1234567890',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    }
  })
  
  // Create sample properties
  await prisma.property.createMany({
    data: [
      {
        name: 'Sunset Apartments',
        type: 'APARTMENT',
        status: 'OCCUPIED',
        address: '123 Sunset Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90028',
        country: 'USA',
        yearBuilt: 2015,
        squareFeet: 1200,
        bedrooms: 2,
        bathrooms: 2,
        purchasePrice: 450000,
        currentValue: 525000,
        monthlyRent: 2800,
        monthlyExpenses: 800,
        capRate: 5.2,
        roi: 8.5,
        occupancyRate: 95,
        ownerId: user.id
      },
      {
        name: 'Downtown Condo',
        type: 'CONDO',
        status: 'AVAILABLE',
        address: '789 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10013',
        country: 'USA',
        yearBuilt: 2020,
        squareFeet: 1800,
        bedrooms: 3,
        bathrooms: 2.5,
        purchasePrice: 1200000,
        currentValue: 1350000,
        monthlyRent: 6500,
        monthlyExpenses: 2000,
        capRate: 4.8,
        roi: 7.2,
        occupancyRate: 0,
        ownerId: user.id
      }
    ]
  })
  
  console.log('Database seeded successfully!')
  console.log('Test user: admin@test.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })