const express = require('express');
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const properties = await prisma.property.findMany({
      where: {
        ownerId: userId
      },
      include: {
        transactions: {
          where: {
            userId: userId
          },
          orderBy: { date: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform data to match frontend expectations
    const transformedProperties = properties.map(property => ({
      id: property.id,
      name: property.name,
      type: property.type,
      location: `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`,
      purchaseDate: property.createdAt.toISOString().split('T')[0],
      purchasePrice: property.purchasePrice,
      currentValue: property.currentValue || property.purchasePrice,
      monthlyIncome: property.monthlyRent || 0,
      expenses: property.monthlyExpenses || 0,
      occupancy: property.status === 'OCCUPIED' ? 100 : 0,
      units: property.type === 'SINGLE_FAMILY' ? 1 : (property.bedrooms || 1),
      description: property.description,
      roi: property.monthlyRent && property.purchasePrice ? 
        ((property.monthlyRent * 12 - (property.monthlyExpenses || 0) * 12) / property.purchasePrice * 100) : 0,
      appreciation: property.currentValue && property.purchasePrice ? 
        ((property.currentValue - property.purchasePrice) / property.purchasePrice * 100) : 0,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      yearBuilt: property.yearBuilt,
      squareFeet: property.squareFeet,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      status: property.status,
      recentTransactions: property.transactions
    }));
    
    res.json(transformedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { 
        id: req.params.id,
        ownerId: req.user.id  // Ensure user owns this property
      },
      include: {
        transactions: {
          orderBy: { date: 'desc' }
        }
      }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Transform data to match frontend expectations
    const transformedProperty = {
      id: property.id,
      name: property.name,
      type: property.type,
      location: `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`,
      purchaseDate: property.createdAt.toISOString().split('T')[0],
      purchasePrice: property.purchasePrice,
      currentValue: property.currentValue || property.purchasePrice,
      monthlyIncome: property.monthlyRent || 0,
      expenses: property.monthlyExpenses || 0,
      occupancy: property.status === 'OCCUPIED' ? 100 : 0,
      units: property.type === 'SINGLE_FAMILY' ? 1 : (property.bedrooms || 1),
      description: property.description,
      roi: property.monthlyRent && property.purchasePrice ? 
        ((property.monthlyRent * 12 - (property.monthlyExpenses || 0) * 12) / property.purchasePrice * 100) : 0,
      appreciation: property.currentValue && property.purchasePrice ? 
        ((property.currentValue - property.purchasePrice) / property.purchasePrice * 100) : 0,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      yearBuilt: property.yearBuilt,
      squareFeet: property.squareFeet,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      status: property.status,
      transactions: property.transactions
    };
    
    res.json(transformedProperty);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      name,
      type,
      address,
      city,
      state,
      zipCode,
      yearBuilt,
      squareFeet,
      bedrooms,
      bathrooms,
      description,
      purchasePrice,
      currentValue,
      monthlyRent,
      monthlyExpenses,
      status = 'AVAILABLE'
    } = req.body;
    
    const newProperty = await prisma.property.create({
      data: {
        name,
        type,
        address,
        city,
        state,
        zipCode,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        squareFeet: squareFeet ? parseInt(squareFeet) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        description,
        purchasePrice: parseFloat(purchasePrice),
        currentValue: currentValue ? parseFloat(currentValue) : null,
        monthlyRent: monthlyRent ? parseFloat(monthlyRent) : null,
        monthlyExpenses: monthlyExpenses ? parseFloat(monthlyExpenses) : null,
        status,
        ownerId: req.user.id
      }
    });
    
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      type,
      address,
      city,
      state,
      zipCode,
      yearBuilt,
      squareFeet,
      bedrooms,
      bathrooms,
      description,
      purchasePrice,
      currentValue,
      monthlyRent,
      monthlyExpenses,
      status
    } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (yearBuilt !== undefined) updateData.yearBuilt = yearBuilt ? parseInt(yearBuilt) : null;
    if (squareFeet !== undefined) updateData.squareFeet = squareFeet ? parseInt(squareFeet) : null;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms ? parseInt(bedrooms) : null;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms ? parseFloat(bathrooms) : null;
    if (description !== undefined) updateData.description = description;
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice);
    if (currentValue !== undefined) updateData.currentValue = currentValue ? parseFloat(currentValue) : null;
    if (monthlyRent !== undefined) updateData.monthlyRent = monthlyRent ? parseFloat(monthlyRent) : null;
    if (monthlyExpenses !== undefined) updateData.monthlyExpenses = monthlyExpenses ? parseFloat(monthlyExpenses) : null;
    if (status !== undefined) updateData.status = status;
    
    const updatedProperty = await prisma.property.update({
      where: { 
        id: req.params.id,
        ownerId: req.user.id  // Ensure user owns this property
      },
      data: updateData
    });
    
    res.json(updatedProperty);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.property.delete({
      where: { 
        id: req.params.id,
        ownerId: req.user.id  // Ensure user owns this property
      }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Property not found' });
    }
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

module.exports = router;