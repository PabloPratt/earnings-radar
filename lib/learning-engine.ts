import { CompanyRanking } from './types';

export interface TradeSignal {
  symbol: string;
  action: 'LONG' | 'SHORT' | 'CLOSE';
  entryPrice: number;
  quantity: number;
  timestamp: string;
  account: string;
}

export interface TradeResult {
  symbol: string;
  action: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profitLoss: number;
  profitLossPercent: number;
  duration: number; // milliseconds
  account: string;
  entryTime: string;
  exitTime: string;
}

export interface LearningProfile {
  totalTrades: number;
  winRate: number;
  avgWinPercent: number;
  avgLossPercent: number;
  profitFactor: number; // total wins / total losses
  bestSymbol: string;
  bestTimeOfDay: string;
  preferredDuration: number; // average holding time
  symbolStats: Map<string, SymbolStats>;
}

interface SymbolStats {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  avgProfit: number;
  winRate: number;
}

export class LearningEngine {
  private openPositions: Map<string, TradeSignal> = new Map();
  private closedTrades: TradeResult[] = [];
  private symbolStats: Map<string, SymbolStats> = new Map();

  recordSignal(signal: TradeSignal) {
    if (signal.action === 'CLOSE') {
      this.closePosition(signal.symbol, signal.entryPrice, signal.timestamp);
    } else {
      this.openPositions.set(signal.symbol, signal);
    }
  }

  private closePosition(symbol: string, exitPrice: number, exitTime: string) {
    const entry = this.openPositions.get(symbol);
    if (!entry) return;

    const profitLoss = (exitPrice - entry.entryPrice) * entry.quantity;
    const profitLossPercent = ((exitPrice - entry.entryPrice) / entry.entryPrice) * 100;
    const duration = new Date(exitTime).getTime() - new Date(entry.timestamp).getTime();

    const trade: TradeResult = {
      symbol,
      action: entry.action as 'LONG' | 'SHORT',
      entryPrice: entry.entryPrice,
      exitPrice,
      quantity: entry.quantity,
      profitLoss,
      profitLossPercent,
      duration,
      account: entry.account,
      entryTime: entry.timestamp,
      exitTime,
    };

    this.closedTrades.push(trade);
    this.updateSymbolStats(trade);
    this.openPositions.delete(symbol);
  }

  private updateSymbolStats(trade: TradeResult) {
    const existing = this.symbolStats.get(trade.symbol) || {
      symbol: trade.symbol,
      trades: 0,
      wins: 0,
      losses: 0,
      avgProfit: 0,
      winRate: 0,
    };

    existing.trades++;
    if (trade.profitLoss > 0) {
      existing.wins++;
      existing.avgProfit = (existing.avgProfit * (existing.wins - 1) + trade.profitLossPercent) / existing.wins;
    } else {
      existing.losses++;
    }
    existing.winRate = existing.wins / existing.trades;

    this.symbolStats.set(trade.symbol, existing);
  }

  getSymbolBias(symbol: string): number {
    const stats = this.symbolStats.get(symbol);
    if (!stats || stats.trades < 3) return 0; // Need minimum trades to learn

    // Return bias factor (-1 to +1) based on win rate
    const bias = (stats.winRate - 0.5) * 2;
    return Math.max(-1, Math.min(1, bias));
  }

  getLearningProfile(): LearningProfile {
    if (this.closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgWinPercent: 0,
        avgLossPercent: 0,
        profitFactor: 0,
        bestSymbol: '',
        bestTimeOfDay: '',
        preferredDuration: 0,
        symbolStats: new Map(),
      };
    }

    const wins = this.closedTrades.filter(t => t.profitLoss > 0);
    const losses = this.closedTrades.filter(t => t.profitLoss < 0);

    const totalWinProfit = wins.reduce((sum, t) => sum + t.profitLoss, 0);
    const totalLossProfit = Math.abs(losses.reduce((sum, t) => sum + t.profitLoss, 0));

    const bestSymbol = Array.from(this.symbolStats.values())
      .sort((a, b) => b.winRate - a.winRate)[0]?.symbol || '';

    const avgDuration = this.closedTrades.reduce((sum, t) => sum + t.duration, 0) / this.closedTrades.length;

    return {
      totalTrades: this.closedTrades.length,
      winRate: wins.length / this.closedTrades.length,
      avgWinPercent: wins.length > 0 ? wins.reduce((sum, t) => sum + t.profitLossPercent, 0) / wins.length : 0,
      avgLossPercent: losses.length > 0 ? losses.reduce((sum, t) => sum + t.profitLossPercent, 0) / losses.length : 0,
      profitFactor: totalLossProfit > 0 ? totalWinProfit / totalLossProfit : 0,
      bestSymbol,
      bestTimeOfDay: this.calculateBestTimeOfDay(),
      preferredDuration: avgDuration,
      symbolStats: this.symbolStats,
    };
  }

  private calculateBestTimeOfDay(): string {
    const hourStats = new Map<number, { wins: number; total: number }>();

    this.closedTrades.forEach(trade => {
      const hour = new Date(trade.entryTime).getHours();
      const stat = hourStats.get(hour) || { wins: 0, total: 0 };
      stat.total++;
      if (trade.profitLoss > 0) stat.wins++;
      hourStats.set(hour, stat);
    });

    let bestHour = 0;
    let bestWinRate = 0;
    hourStats.forEach((stat, hour) => {
      const winRate = stat.wins / stat.total;
      if (winRate > bestWinRate && stat.total >= 2) {
        bestWinRate = winRate;
        bestHour = hour;
      }
    });

    return `${bestHour}:00 UTC`;
  }

  applyLearningBoost(ranking: CompanyRanking): CompanyRanking {
    const symbolBias = this.getSymbolBias(ranking.ticker);

    // If Paradox Algo has a good track record with this symbol, boost it
    const boostFactor = 1 + symbolBias * 10; // Up to ±10% boost

    return {
      ...ranking,
      compositeScore: ranking.compositeScore * boostFactor,
    };
  }
}
