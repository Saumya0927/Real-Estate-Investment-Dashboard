/**
 * Report Service - Professional PDF Report Generation for Real Estate Portfolio
 * Generates comprehensive reports using real property and transaction data
 */

import transactionService, { Transaction } from './transactionService';
import portfolioHistoryService from './portfolioHistoryService';

export interface ReportData {
  portfolioSummary: {
    totalValue: number;
    totalProperties: number;
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    averageROI: number;
    occupancyRate: number;
  };
  properties: Array<{
    id: string;
    name: string;
    address: string;
    type: string;
    purchasePrice: number;
    currentValue: number;
    monthlyRent: number;
    roi: number;
    netCashFlow: number;
    status: string;
  }>;
  transactions: Transaction[];
  monthlyPerformance: Array<{
    month: string;
    income: number;
    expenses: number;
    netCashFlow: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  incomeBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface ReportOptions {
  reportType: 'portfolio' | 'property' | 'financial' | 'tax';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  propertyId?: string;
  includeCharts: boolean;
  includeTransactions: boolean;
  includeImages: boolean;
  format: 'pdf' | 'excel' | 'csv';
}

class ReportService {
  /**
   * Generate comprehensive portfolio report
   */
  async generatePortfolioReport(properties: any[], options: ReportOptions): Promise<ReportData> {
    const startDate = new Date(options.dateRange.startDate);
    const endDate = new Date(options.dateRange.endDate);

    // Calculate portfolio summary
    const totalValue = properties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice || 0), 0);
    const totalPurchasePrice = properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
    const totalIncome = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0) * 12; // Annualized
    const occupiedProperties = properties.filter(p => p.status === 'OCCUPIED').length;
    const occupancyRate = properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0;
    const averageROI = totalPurchasePrice > 0 ? ((totalValue - totalPurchasePrice) / totalPurchasePrice) * 100 : 0;

    // Get transaction data
    const transactions = options.propertyId 
      ? transactionService.getPropertyTransactions(options.propertyId)
      : transactionService.getTransactionsByDateRange(startDate, endDate);

    const transactionSummary = options.propertyId
      ? transactionService.getPropertySummary(options.propertyId, startDate, endDate)
      : transactionService.getPortfolioSummary(startDate, endDate);

    // Get monthly performance
    const monthlyPerformance = transactionService.getMonthlyCashFlow(options.propertyId, 12);

    // Get expense and income breakdowns
    const expenseBreakdown = transactionService.getExpenseBreakdown(options.propertyId, startDate, endDate);
    const incomeBreakdown = transactionService.getIncomeBreakdown(options.propertyId, startDate, endDate);

    // Format property data for report
    const reportProperties = properties.map(property => ({
      id: property.id,
      name: property.name || 'Unnamed Property',
      address: `${property.address || ''}, ${property.city || ''}, ${property.state || ''}`.trim(),
      type: property.type || 'Unknown',
      purchasePrice: property.purchasePrice || 0,
      currentValue: property.currentValue || property.purchasePrice || 0,
      monthlyRent: property.monthlyRent || 0,
      roi: property.purchasePrice > 0 ? 
        ((property.currentValue || property.purchasePrice) - property.purchasePrice) / property.purchasePrice * 100 : 0,
      netCashFlow: (property.monthlyRent || 0) * 12, // Simplified - should include expenses
      status: property.status || 'Unknown'
    }));

    return {
      portfolioSummary: {
        totalValue,
        totalProperties: properties.length,
        totalIncome: transactionSummary.totalIncome,
        totalExpenses: transactionSummary.totalExpenses,
        netCashFlow: transactionSummary.netCashFlow,
        averageROI,
        occupancyRate
      },
      properties: reportProperties,
      transactions,
      monthlyPerformance,
      expenseBreakdown,
      incomeBreakdown
    };
  }

  /**
   * Generate property-specific report
   */
  async generatePropertyReport(propertyId: string, properties: any[], options: ReportOptions): Promise<ReportData> {
    const property = properties.find(p => p.id === propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    return this.generatePortfolioReport([property], { ...options, propertyId });
  }

  /**
   * Generate financial summary report
   */
  async generateFinancialReport(properties: any[], options: ReportOptions): Promise<string> {
    const reportData = await this.generatePortfolioReport(properties, options);
    
    // Generate HTML report that can be converted to PDF
    const html = this.generateFinancialHTML(reportData, options);
    return html;
  }

  /**
   * Generate tax report for accountants
   */
  async generateTaxReport(properties: any[], options: ReportOptions): Promise<string> {
    const reportData = await this.generatePortfolioReport(properties, options);
    
    // Filter for tax-deductible transactions
    const taxDeductibleTransactions = reportData.transactions.filter(t => t.taxDeductible);
    const totalTaxDeductions = taxDeductibleTransactions.reduce((sum, t) => sum + t.amount, 0);

    const html = this.generateTaxHTML(reportData, taxDeductibleTransactions, totalTaxDeductions, options);
    return html;
  }

  /**
   * Generate professional HTML report for financial summary
   */
  private generateFinancialHTML(data: ReportData, options: ReportOptions): string {
    const currentDate = new Date().toLocaleDateString();
    const startDate = new Date(options.dateRange.startDate).toLocaleDateString();
    const endDate = new Date(options.dateRange.endDate).toLocaleDateString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real Estate Portfolio Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0; opacity: 0.9; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; }
        .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; }
        .summary-card .value { font-size: 24px; font-weight: bold; color: #333; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .section { margin-bottom: 40px; }
        .section h2 { border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        tr:hover { background-color: #f8f9fa; }
        .chart-placeholder { height: 300px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; margin: 20px 0; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        @media print { body { margin: 0; } .header { background: #667eea !important; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>Real Estate Portfolio Report</h1>
        <p>Generated on ${currentDate}</p>
        <p>Period: ${startDate} - ${endDate}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <h3>Total Portfolio Value</h3>
            <div class="value">$${data.portfolioSummary.totalValue.toLocaleString()}</div>
        </div>
        <div class="summary-card">
            <h3>Total Properties</h3>
            <div class="value">${data.portfolioSummary.totalProperties}</div>
        </div>
        <div class="summary-card">
            <h3>Net Cash Flow</h3>
            <div class="value ${data.portfolioSummary.netCashFlow >= 0 ? 'positive' : 'negative'}">
                $${data.portfolioSummary.netCashFlow.toLocaleString()}
            </div>
        </div>
        <div class="summary-card">
            <h3>Average ROI</h3>
            <div class="value ${data.portfolioSummary.averageROI >= 0 ? 'positive' : 'negative'}">
                ${data.portfolioSummary.averageROI.toFixed(1)}%
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Property Portfolio</h2>
        <table>
            <thead>
                <tr>
                    <th>Property Name</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Purchase Price</th>
                    <th>Current Value</th>
                    <th>Monthly Rent</th>
                    <th>ROI</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${data.properties.map(property => `
                    <tr>
                        <td>${property.name}</td>
                        <td>${property.address}</td>
                        <td>${property.type}</td>
                        <td>$${property.purchasePrice.toLocaleString()}</td>
                        <td>$${property.currentValue.toLocaleString()}</td>
                        <td>$${property.monthlyRent.toLocaleString()}</td>
                        <td class="${property.roi >= 0 ? 'positive' : 'negative'}">${property.roi.toFixed(1)}%</td>
                        <td>${property.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Monthly Performance</h2>
        <div class="chart-placeholder">
            Monthly Cash Flow Chart (${data.monthlyPerformance.length} months of data)
        </div>
        <table>
            <thead>
                <tr>
                    <th>Month</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Net Cash Flow</th>
                </tr>
            </thead>
            <tbody>
                ${data.monthlyPerformance.map(month => `
                    <tr>
                        <td>${month.month}</td>
                        <td class="positive">$${month.income.toLocaleString()}</td>
                        <td class="negative">$${month.expenses.toLocaleString()}</td>
                        <td class="${month.netCashFlow >= 0 ? 'positive' : 'negative'}">
                            $${month.netCashFlow.toLocaleString()}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    ${options.includeTransactions && data.transactions.length > 0 ? `
    <div class="section">
        <h2>Recent Transactions</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.transactions.slice(0, 20).map(transaction => `
                    <tr>
                        <td>${new Date(transaction.date).toLocaleDateString()}</td>
                        <td>${transaction.propertyName || 'Unknown'}</td>
                        <td>
                            <span style="background: ${transaction.type === 'INCOME' ? '#d4edda' : '#f8d7da'}; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
                                ${transaction.type}
                            </span>
                        </td>
                        <td>${transaction.category}</td>
                        <td>${transaction.description}</td>
                        <td class="${transaction.type === 'INCOME' ? 'positive' : 'negative'}">
                            ${transaction.type === 'INCOME' ? '+' : '-'}$${transaction.amount.toLocaleString()}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <h2>Expense Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${data.expenseBreakdown.map(expense => `
                    <tr>
                        <td>${expense.category}</td>
                        <td class="negative">$${expense.amount.toLocaleString()}</td>
                        <td>${expense.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>This report was generated automatically by the Real Estate Investment Dashboard.</p>
        <p>Data accurate as of ${currentDate}. Please verify all figures before making financial decisions.</p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate tax report HTML
   */
  private generateTaxHTML(data: ReportData, taxDeductibleTransactions: Transaction[], totalDeductions: number, options: ReportOptions): string {
    const currentDate = new Date().toLocaleDateString();
    const taxYear = new Date(options.dateRange.endDate).getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Report ${taxYear}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
        .header { background: #2c5530; color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 28px; }
        .tax-summary { background: #f8f9fa; border: 2px solid #2c5530; border-radius: 10px; padding: 25px; margin-bottom: 30px; }
        .tax-summary h2 { color: #2c5530; margin-top: 0; }
        .deduction-total { font-size: 24px; font-weight: bold; color: #2c5530; background: white; padding: 15px; border-radius: 5px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #2c5530; color: white; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #2c5530; border-bottom: 2px solid #2c5530; padding-bottom: 10px; }
        .disclaimer { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 30px; }
        .disclaimer strong { color: #856404; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tax Deduction Report</h1>
        <p>Tax Year: ${taxYear}</p>
        <p>Generated on ${currentDate}</p>
    </div>

    <div class="tax-summary">
        <h2>Tax Deduction Summary</h2>
        <div class="deduction-total">
            Total Tax Deductible Expenses: $${totalDeductions.toLocaleString()}
        </div>
        <p style="margin-top: 15px;">
            This represents ${taxDeductibleTransactions.length} tax-deductible transactions across your real estate portfolio.
        </p>
    </div>

    <div class="section">
        <h2>Deductible Expenses by Category</h2>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Total Amount</th>
                    <th>Transaction Count</th>
                    <th>Percentage of Total</th>
                </tr>
            </thead>
            <tbody>
                ${data.expenseBreakdown
                  .filter(expense => {
                    const categoryTransactions = taxDeductibleTransactions.filter(t => t.category === expense.category);
                    return categoryTransactions.length > 0;
                  })
                  .map(expense => {
                    const categoryAmount = taxDeductibleTransactions
                      .filter(t => t.category === expense.category)
                      .reduce((sum, t) => sum + t.amount, 0);
                    const percentage = totalDeductions > 0 ? (categoryAmount / totalDeductions) * 100 : 0;
                    const count = taxDeductibleTransactions.filter(t => t.category === expense.category).length;
                    
                    return `
                      <tr>
                          <td>${expense.category}</td>
                          <td>$${categoryAmount.toLocaleString()}</td>
                          <td>${count}</td>
                          <td>${percentage.toFixed(1)}%</td>
                      </tr>
                    `;
                  }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>All Tax Deductible Transactions</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Property</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${taxDeductibleTransactions.map(transaction => `
                    <tr>
                        <td>${new Date(transaction.date).toLocaleDateString()}</td>
                        <td>${transaction.propertyName || 'Unknown Property'}</td>
                        <td>${transaction.category}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.vendor || 'N/A'}</td>
                        <td>$${transaction.amount.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="disclaimer">
        <strong>Important Disclaimer:</strong> This report is for informational purposes only and should not be considered tax advice. Please consult with a qualified tax professional or accountant to ensure proper tax treatment of all real estate investments and deductions. Tax laws vary by jurisdiction and individual circumstances.
    </div>
</body>
</html>
    `;
  }

  /**
   * Export report data to CSV
   */
  exportToCSV(data: ReportData, type: 'properties' | 'transactions' = 'properties'): string {
    if (type === 'properties') {
      const headers = ['Property Name', 'Address', 'Type', 'Purchase Price', 'Current Value', 'Monthly Rent', 'ROI %', 'Status'];
      const rows = data.properties.map(p => [
        p.name,
        p.address,
        p.type,
        p.purchasePrice,
        p.currentValue,
        p.monthlyRent,
        p.roi.toFixed(2),
        p.status
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    } else {
      const headers = ['Date', 'Property', 'Type', 'Category', 'Description', 'Amount', 'Tax Deductible'];
      const rows = data.transactions.map(t => [
        t.date,
        t.propertyName || '',
        t.type,
        t.category,
        `"${t.description}"`,
        t.amount,
        t.taxDeductible ? 'Yes' : 'No'
      ]);
      
      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
  }

  /**
   * Convert HTML to PDF (browser-based)
   */
  async generatePDF(html: string, filename: string = 'report.pdf'): Promise<void> {
    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      };
    }
  }

  /**
   * Download HTML report as file
   */
  downloadHTMLReport(html: string, filename: string = 'portfolio-report.html'): void {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const reportService = new ReportService();
export default reportService;