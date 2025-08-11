import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (simplified schema)
  await prisma.transaction.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Cleared existing data')
  
  // Create or update the single user
  const user = await prisma.user.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      email: 'admin@personal.com',
      firstName: 'Saumya',
      lastName: 'Patel',
    },
  })
  console.log('👤 Created user:', user.firstName, user.lastName)
  
  // Create sample properties
  const properties = [
    {
      name: 'Downtown Condo',
      type: 'CONDO',
      status: 'OCCUPIED',
      address: '123 Main Street, Unit 4B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      yearBuilt: 2015,
      squareFeet: 850,
      bedrooms: 2,
      bathrooms: 1.5,
      description: 'Modern downtown condo with great city views and walking distance to public transit.',
      purchasePrice: 650000,
      currentValue: 720000,
      monthlyRent: 3200,
      monthlyExpenses: 450,
    },
    {
      name: 'Suburban Family Home',
      type: 'SINGLE_FAMILY',
      status: 'OCCUPIED',
      address: '456 Oak Avenue',
      city: 'Austin',
      state: 'TX',
      zipCode: '78745',
      yearBuilt: 2008,
      squareFeet: 1850,
      bedrooms: 3,
      bathrooms: 2.5,
      description: 'Beautiful single-family home in quiet neighborhood with great schools.',
      purchasePrice: 285000,
      currentValue: 340000,
      monthlyRent: 2100,
      monthlyExpenses: 320,
    },
    {
      name: 'Investment Duplex',
      type: 'MULTI_FAMILY',
      status: 'AVAILABLE',
      address: '789 Pine Street',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      yearBuilt: 1995,
      squareFeet: 2400,
      bedrooms: 4,
      bathrooms: 3,
      description: 'Duplex with separate entrances, perfect for rental income.',
      purchasePrice: 220000,
      currentValue: 265000,
      monthlyRent: 1800,
      monthlyExpenses: 280,
    }
  ]

  const createdProperties = []
  for (const propertyData of properties) {
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: '1',
      },
    })
    createdProperties.push(property)
    console.log('🏠 Created property:', property.name)
  }
  // Create sample transactions for each property
  const paymentMethods = ['BANK_TRANSFER', 'CHECK', 'CASH']

  // Generate transactions for the last 6 months
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6)

  let transactionCount = 0
  for (const property of createdProperties) {
    // Monthly rent income
    for (let month = 0; month < 6; month++) {
      const transactionDate = new Date(startDate)
      transactionDate.setMonth(transactionDate.getMonth() + month)
      transactionDate.setDate(1)

      if (property.monthlyRent && property.status === 'OCCUPIED') {
        await prisma.transaction.create({
          data: {
            type: 'INCOME',
            category: 'RENT',
            amount: property.monthlyRent,
            date: transactionDate,
            description: `Monthly rent for ${property.name}`,
            paymentMethod: 'BANK_TRANSFER',
            propertyId: property.id,
            userId: '1',
          },
        })
        transactionCount++
      }

      // Monthly expenses
      if (property.monthlyExpenses) {
        await prisma.transaction.create({
          data: {
            type: 'EXPENSE',
            category: 'MANAGEMENT',
            amount: property.monthlyExpenses,
            date: new Date(transactionDate.getTime() + 24 * 60 * 60 * 1000), // Next day
            description: `Monthly expenses for ${property.name}`,
            paymentMethod: 'BANK_TRANSFER',
            propertyId: property.id,
            userId: '1',
          },
        })
        transactionCount++
      }
    }

    // Random maintenance expenses
    const maintenanceCount = Math.floor(Math.random() * 4) + 1 // 1-4 maintenance items
    for (let i = 0; i < maintenanceCount; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()))
      const maintenanceItems = [
        'HVAC maintenance',
        'Plumbing repair',
        'Appliance replacement',
        'Lawn care',
        'Painting',
        'Carpet cleaning',
        'Window repair',
        'Electrical work'
      ]
      const randomItem = maintenanceItems[Math.floor(Math.random() * maintenanceItems.length)]
      const amount = Math.floor(Math.random() * 800) + 100 // $100-$900

      await prisma.transaction.create({
        data: {
          type: 'EXPENSE',
          category: Math.random() > 0.5 ? 'MAINTENANCE' : 'REPAIR',
          amount: amount,
          date: randomDate,
          description: `${randomItem} for ${property.name}`,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          notes: `Contractor work completed`,
          propertyId: property.id,
          userId: '1',
        },
      })
      transactionCount++
    }
  }

  // Add some general investment expenses
  const generalExpenses = [
    { category: 'TAX', amount: 2500, description: 'Property taxes Q1' },
    { category: 'INSURANCE', amount: 1200, description: 'Annual property insurance' },
    { category: 'TAX', amount: 800, description: 'Tax preparation fees' },
  ]

  for (const expense of generalExpenses) {
    const randomDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()))
    await prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: expense.category,
        amount: expense.amount,
        date: randomDate,
        description: expense.description,
        paymentMethod: 'BANK_TRANSFER',
        userId: '1',
      },
    })
    transactionCount++
  }

  console.log('💰 Created', transactionCount, 'transactions')
  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })