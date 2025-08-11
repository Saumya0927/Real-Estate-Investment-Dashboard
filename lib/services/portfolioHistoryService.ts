/**
 * Portfolio History Service - Track real portfolio performance over time
 * Stores historical snapshots to calculate accurate month-over-month changes
 */

interface PortfolioSnapshot {
  id: string;
  timestamp: string;
  portfolioValue: number;
  totalProperties: number;
  monthlyIncome: number;
  occupancyRate: number;
  properties: Array<{
    id: string;
    name: string;
    currentValue: number;
    monthlyRent: number;
    status: string;
  }>;
}

interface PortfolioMetrics {
  portfolioValue: number;
  portfolioValueChange: number;
  totalProperties: number;
  totalPropertiesChange: number;
  monthlyIncome: number;
  monthlyIncomeChange: number;
  occupancyRate: number;
  occupancyRateChange: number;
}

class PortfolioHistoryService {
  private readonly STORAGE_KEY = 'portfolio_history';
  private readonly MAX_SNAPSHOTS = 365; // Store up to 1 year of daily snapshots

  constructor() {
    // Take a snapshot whenever the service is initialized (daily check)
    this.checkAndTakeSnapshot();
  }

  /**
   * Take a snapshot of current portfolio state
   */
  takeSnapshot(properties: any[]): PortfolioSnapshot {
    const timestamp = new Date().toISOString();
    const portfolioValue = properties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice || 0), 0);
    const totalProperties = properties.length;
    const monthlyIncome = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
    const occupiedProperties = properties.filter(p => p.status === 'OCCUPIED').length;
    const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

    const snapshot: PortfolioSnapshot = {
      id: `snapshot_${Date.now()}`,
      timestamp,
      portfolioValue,
      totalProperties,
      monthlyIncome,
      occupancyRate,
      properties: properties.map(p => ({
        id: p.id,
        name: p.name || 'Unnamed Property',
        currentValue: p.currentValue || p.purchasePrice || 0,
        monthlyRent: p.monthlyRent || 0,
        status: p.status || 'UNKNOWN'
      }))
    };

    this.saveSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Calculate portfolio metrics with real historical changes
   */
  calculateMetrics(currentProperties: any[]): PortfolioMetrics {
    // Calculate current values
    const portfolioValue = currentProperties.reduce((sum, p) => sum + (p.currentValue || p.purchasePrice || 0), 0);
    const totalProperties = currentProperties.length;
    const monthlyIncome = currentProperties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
    const occupiedProperties = currentProperties.filter(p => p.status === 'OCCUPIED').length;
    const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

    // Get historical snapshot from 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const historicalSnapshot = this.getSnapshotNearDate(thirtyDaysAgo);

    let portfolioValueChange = 0;
    let totalPropertiesChange = 0;
    let monthlyIncomeChange = 0;
    let occupancyRateChange = 0;

    if (historicalSnapshot) {
      // Calculate real percentage changes
      portfolioValueChange = historicalSnapshot.portfolioValue > 0 
        ? ((portfolioValue - historicalSnapshot.portfolioValue) / historicalSnapshot.portfolioValue) * 100 
        : 0;
      
      totalPropertiesChange = historicalSnapshot.totalProperties > 0 
        ? ((totalProperties - historicalSnapshot.totalProperties) / historicalSnapshot.totalProperties) * 100 
        : 0;
      
      monthlyIncomeChange = historicalSnapshot.monthlyIncome > 0 
        ? ((monthlyIncome - historicalSnapshot.monthlyIncome) / historicalSnapshot.monthlyIncome) * 100 
        : 0;
      
      occupancyRateChange = historicalSnapshot.occupancyRate > 0 
        ? ((occupancyRate - historicalSnapshot.occupancyRate) / historicalSnapshot.occupancyRate) * 100 
        : 0;
    } else {
      // If no historical data, use purchase vs current value for portfolio change
      const totalPurchasePrice = currentProperties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
      if (totalPurchasePrice > 0) {
        portfolioValueChange = ((portfolioValue - totalPurchasePrice) / totalPurchasePrice) * 100;
      }
    }

    return {
      portfolioValue,
      portfolioValueChange: Number(portfolioValueChange.toFixed(1)),
      totalProperties,
      totalPropertiesChange: Number(totalPropertiesChange.toFixed(1)),
      monthlyIncome,
      monthlyIncomeChange: Number(monthlyIncomeChange.toFixed(1)),
      occupancyRate,
      occupancyRateChange: Number(occupancyRateChange.toFixed(1))
    };
  }

  /**
   * Get portfolio performance over time for charts
   */
  getPerformanceHistory(days: number = 90): Array<{
    date: string;
    portfolioValue: number;
    monthlyIncome: number;
    totalProperties: number;
  }> {
    const snapshots = this.getSnapshots();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return snapshots
      .filter(snapshot => new Date(snapshot.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(snapshot => ({
        date: new Date(snapshot.timestamp).toISOString().split('T')[0],
        portfolioValue: snapshot.portfolioValue,
        monthlyIncome: snapshot.monthlyIncome,
        totalProperties: snapshot.totalProperties
      }));
  }

  /**
   * Check if we need to take a daily snapshot
   */
  private checkAndTakeSnapshot(): void {
    if (typeof window === 'undefined') return;

    const lastSnapshotDate = localStorage.getItem('last_snapshot_date');
    const today = new Date().toISOString().split('T')[0];

    if (lastSnapshotDate !== today) {
      localStorage.setItem('last_snapshot_date', today);
      // Snapshot will be taken when calculateMetrics is called with current properties
    }
  }

  /**
   * Save a snapshot to localStorage
   */
  private saveSnapshot(snapshot: PortfolioSnapshot): void {
    try {
      if (typeof window === 'undefined') return;

      const snapshots = this.getSnapshots();
      snapshots.unshift(snapshot);

      // Limit number of snapshots
      if (snapshots.length > this.MAX_SNAPSHOTS) {
        snapshots.splice(this.MAX_SNAPSHOTS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snapshots));
    } catch (error) {
      console.error('Error saving portfolio snapshot:', error);
    }
  }

  /**
   * Get all snapshots from localStorage
   */
  private getSnapshots(): PortfolioSnapshot[] {
    try {
      if (typeof window === 'undefined') return [];

      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading portfolio snapshots:', error);
      return [];
    }
  }

  /**
   * Find snapshot closest to a specific date
   */
  private getSnapshotNearDate(targetDate: Date): PortfolioSnapshot | null {
    const snapshots = this.getSnapshots();
    if (snapshots.length === 0) return null;

    // Find the snapshot with the closest timestamp to the target date
    let closest: PortfolioSnapshot | null = null;
    let closestDistance = Infinity;

    for (const snapshot of snapshots) {
      const snapshotDate = new Date(snapshot.timestamp);
      const distance = Math.abs(snapshotDate.getTime() - targetDate.getTime());
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = snapshot;
      }
    }

    return closest;
  }

  /**
   * Clear all snapshots (for development/testing)
   */
  clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('last_snapshot_date');
    }
  }
}

export const portfolioHistoryService = new PortfolioHistoryService();
export default portfolioHistoryService;