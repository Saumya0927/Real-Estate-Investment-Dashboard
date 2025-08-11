/**
 * Transaction Service - Professional Real Estate Transaction Management
 * Handles income, expenses, and financial tracking for properties
 */

export interface Transaction {
  id: string;
  propertyId: string;
  propertyName?: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  vendor?: string;
  receiptUrl?: string;
  recurring?: boolean;
  recurringFrequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  taxDeductible?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  yearlyIncome: number;
  yearlyExpenses: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  transactions: Transaction[];
}

class TransactionService {
  private readonly STORAGE_KEY = 'property_transactions';

  /**
   * Record a new transaction
   */
  recordTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTransaction);
    this.saveTransactions(transactions);

    return newTransaction;
  }

  /**
   * Update an existing transaction
   */
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      return null;
    }

    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveTransactions(transactions);
    return transactions[index];
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) {
      return false;
    }

    transactions.splice(index, 1);
    this.saveTransactions(transactions);
    return true;
  }

  /**
   * Get all transactions
   */
  getTransactions(): Transaction[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific property
   */
  getPropertyTransactions(propertyId: string): Transaction[] {
    return this.getTransactions().filter(t => t.propertyId === propertyId);
  }

  /**
   * Get transactions within a date range
   */
  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.getTransactions().filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  /**
   * Get transaction summary for a property
   */
  getPropertySummary(propertyId: string, startDate?: Date, endDate?: Date): TransactionSummary {
    let transactions = this.getPropertyTransactions(propertyId);
    
    if (startDate && endDate) {
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return this.calculateSummary(transactions);
  }

  /**
   * Get portfolio-wide transaction summary
   */
  getPortfolioSummary(startDate?: Date, endDate?: Date): TransactionSummary {
    let transactions = this.getTransactions();
    
    if (startDate && endDate) {
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return this.calculateSummary(transactions);
  }

  /**
   * Get expense breakdown by category
   */
  getExpenseBreakdown(propertyId?: string, startDate?: Date, endDate?: Date): CategorySummary[] {
    let transactions = propertyId ? this.getPropertyTransactions(propertyId) : this.getTransactions();
    
    if (startDate && endDate) {
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryMap = new Map<string, Transaction[]>();
    expenses.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(transaction);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryTransactions]) => {
      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        transactionCount: categoryTransactions.length,
        transactions: categoryTransactions
      };
    }).sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get income breakdown by category
   */
  getIncomeBreakdown(propertyId?: string, startDate?: Date, endDate?: Date): CategorySummary[] {
    let transactions = propertyId ? this.getPropertyTransactions(propertyId) : this.getTransactions();
    
    if (startDate && endDate) {
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    const income = transactions.filter(t => t.type === 'INCOME');
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryMap = new Map<string, Transaction[]>();
    income.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(transaction);
    });

    return Array.from(categoryMap.entries()).map(([category, categoryTransactions]) => {
      const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        category,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
        transactionCount: categoryTransactions.length,
        transactions: categoryTransactions
      };
    }).sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get monthly cash flow data for charts
   */
  getMonthlyCashFlow(propertyId?: string, months: number = 12): Array<{
    month: string;
    income: number;
    expenses: number;
    netCashFlow: number;
  }> {
    const transactions = propertyId ? this.getPropertyTransactions(propertyId) : this.getTransactions();
    
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    
    // Initialize last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData.set(monthKey, { income: 0, expenses: 0 });
    }

    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const monthKey = transaction.date.slice(0, 7);
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        if (transaction.type === 'INCOME') {
          data.income += transaction.amount;
        } else {
          data.expenses += transaction.amount;
        }
      }
    });

    return Array.from(monthlyData.entries()).map(([monthKey, data]) => ({
      month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      income: data.income,
      expenses: data.expenses,
      netCashFlow: data.income - data.expenses
    }));
  }

  /**
   * Record common income transactions
   */
  recordRentPayment(propertyId: string, propertyName: string, amount: number, tenant?: string): Transaction {
    return this.recordTransaction({
      propertyId,
      propertyName,
      type: 'INCOME',
      category: 'Rent',
      amount,
      description: tenant ? `Rent payment from ${tenant}` : 'Rent payment',
      date: new Date().toISOString().split('T')[0],
      recurring: true,
      recurringFrequency: 'MONTHLY',
      tags: ['rent', 'income']
    });
  }

  recordSecurityDeposit(propertyId: string, propertyName: string, amount: number, tenant?: string): Transaction {
    return this.recordTransaction({
      propertyId,
      propertyName,
      type: 'INCOME',
      category: 'Security Deposit',
      amount,
      description: tenant ? `Security deposit from ${tenant}` : 'Security deposit',
      date: new Date().toISOString().split('T')[0],
      tags: ['deposit', 'income']
    });
  }

  /**
   * Record common expense transactions
   */
  recordMaintenance(propertyId: string, propertyName: string, amount: number, description: string, vendor?: string): Transaction {
    return this.recordTransaction({
      propertyId,
      propertyName,
      type: 'EXPENSE',
      category: 'Maintenance',
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
      vendor,
      taxDeductible: true,
      tags: ['maintenance', 'expense']
    });
  }

  recordUtilities(propertyId: string, propertyName: string, amount: number, utilityType: string): Transaction {
    return this.recordTransaction({
      propertyId,
      propertyName,
      type: 'EXPENSE',
      category: 'Utilities',
      amount,
      description: `${utilityType} bill`,
      date: new Date().toISOString().split('T')[0],
      recurring: true,
      recurringFrequency: 'MONTHLY',
      taxDeductible: true,
      tags: ['utilities', 'expense', utilityType.toLowerCase()]
    });
  }

  recordPropertyTax(propertyId: string, propertyName: string, amount: number): Transaction {
    return this.recordTransaction({
      propertyId,
      propertyName,
      type: 'EXPENSE',
      category: 'Property Tax',
      amount,
      description: 'Property tax payment',
      date: new Date().toISOString().split('T')[0],
      recurring: true,
      recurringFrequency: 'YEARLY',
      taxDeductible: true,
      tags: ['tax', 'expense']
    });
  }

  recordInsurance(propertyId: string, propertyName: string, amount: number, insuranceType: string = 'Property Insurance'): Transaction {
    return this.recordTransaction({
      propertyId,
      propertyName,
      type: 'EXPENSE',
      category: 'Insurance',
      amount,
      description: insuranceType,
      date: new Date().toISOString().split('T')[0],
      recurring: true,
      recurringFrequency: 'YEARLY',
      taxDeductible: true,
      tags: ['insurance', 'expense']
    });
  }

  /**
   * Calculate transaction summary
   */
  private calculateSummary(transactions: Transaction[]): TransactionSummary {
    const income = transactions.filter(t => t.type === 'INCOME');
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate monthly and yearly averages
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const monthlyIncomeTransactions = income.filter(t => new Date(t.date) >= oneMonthAgo);
    const monthlyExpenseTransactions = expenses.filter(t => new Date(t.date) >= oneMonthAgo);
    const yearlyIncomeTransactions = income.filter(t => new Date(t.date) >= oneYearAgo);
    const yearlyExpenseTransactions = expenses.filter(t => new Date(t.date) >= oneYearAgo);
    
    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
      monthlyIncome: monthlyIncomeTransactions.reduce((sum, t) => sum + t.amount, 0),
      monthlyExpenses: monthlyExpenseTransactions.reduce((sum, t) => sum + t.amount, 0),
      yearlyIncome: yearlyIncomeTransactions.reduce((sum, t) => sum + t.amount, 0),
      yearlyExpenses: yearlyExpenseTransactions.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length
    };
  }

  /**
   * Save transactions to localStorage
   */
  private saveTransactions(transactions: Transaction[]): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  /**
   * Generate unique ID for transactions
   */
  private generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all transactions (for development/testing)
   */
  clearTransactions(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Export transactions to CSV
   */
  exportToCSV(transactions: Transaction[] = this.getTransactions()): string {
    if (transactions.length === 0) {
      return '';
    }

    const headers = [
      'Date', 'Property', 'Type', 'Category', 'Amount', 'Description', 
      'Vendor', 'Payment Method', 'Tax Deductible', 'Recurring', 'Tags'
    ];

    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.propertyName || '',
        t.type,
        t.category,
        t.amount,
        `"${t.description}"`,
        t.vendor || '',
        t.paymentMethod || '',
        t.taxDeductible ? 'Yes' : 'No',
        t.recurring ? 'Yes' : 'No',
        t.tags ? t.tags.join('; ') : ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

export const transactionService = new TransactionService();
export default transactionService;