const express = require('express');
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all transactions with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      propertyId,
      startDate, 
      endDate, 
      limit = 50,
      offset = 0 
    } = req.query;
    
    const where = {
      userId: req.user.id  // Filter by authenticated user
    };
    
    if (type) where.type = type;
    if (category) where.category = category;
    if (propertyId) where.propertyId = propertyId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { 
        id: req.params.id,
        userId: req.user.id  // Ensure user owns this transaction
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true
          }
        }
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      description,
      paymentMethod,
      notes,
      propertyId
    } = req.body;
    
    if (!type || !category || !amount || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, category, amount, date' 
      });
    }
    
    const newTransaction = await prisma.transaction.create({
      data: {
        type,
        category,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        paymentMethod,
        notes,
        propertyId: propertyId || null,
        userId: req.user.id
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });
    
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      description,
      paymentMethod,
      notes,
      propertyId
    } = req.body;
    
    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (description !== undefined) updateData.description = description;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;
    if (propertyId !== undefined) updateData.propertyId = propertyId || null;
    
    const updatedTransaction = await prisma.transaction.update({
      where: { 
        id: req.params.id,
        userId: req.user.id  // Ensure user owns this transaction
      },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });
    
    res.json(updatedTransaction);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: { 
        id: req.params.id,
        userId: req.user.id  // Ensure user owns this transaction
      }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get transaction statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate, propertyId } = req.query;
    
    const where = {
      userId: req.user.id  // Filter by authenticated user
    };
    if (propertyId) where.propertyId = propertyId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const [
      totalIncome,
      totalExpenses,
      transactionCount,
      recentTransactions
    ] = await Promise.all([
      // Total income
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true
      }),
      // Total expenses
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true
      }),
      // Total transaction count
      prisma.transaction.count({ where }),
      // Recent transactions
      prisma.transaction.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      })
    ]);
    
    const summary = {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      netIncome: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      incomeTransactionCount: totalIncome._count,
      expenseTransactionCount: totalExpenses._count,
      totalTransactionCount: transactionCount,
      recentTransactions
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
  }
});

module.exports = router;