import { NextRequest, NextResponse } from 'next/server';
import { LearningEngine, TradeSignal } from '@/lib/learning-engine';

// Global learning engine instance
const learningEngine = new LearningEngine();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Convert webhook format to TradeSignal format
    const signal: TradeSignal = {
      symbol: (data.symbol || '').replace(/[!~]/g, '').trim(),
      action: data.data?.toUpperCase() || 'LONG',
      entryPrice: parseFloat(data.price) || 0,
      quantity: parseInt(data.quantity) || 0,
      timestamp: data.date || new Date().toISOString(),
      account: data.multiple_accounts?.[0]?.account_id || 'unknown',
    };

    if (!signal.symbol) {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
    }

    learningEngine.recordSignal(signal);

    return NextResponse.json({
      status: 'ok',
      signal: signal,
      recorded: true,
    });
  } catch (error) {
    console.error('Trade analysis error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const profile = learningEngine.getLearningProfile();

  return NextResponse.json({
    profile: {
      totalTrades: profile.totalTrades,
      winRate: (profile.winRate * 100).toFixed(2) + '%',
      avgWinPercent: profile.avgWinPercent.toFixed(2) + '%',
      avgLossPercent: profile.avgLossPercent.toFixed(2) + '%',
      profitFactor: profile.profitFactor.toFixed(2),
      bestSymbol: profile.bestSymbol,
      bestTimeOfDay: profile.bestTimeOfDay,
      preferredDuration: `${(profile.preferredDuration / (1000 * 60 * 60)).toFixed(1)} hours`,
    },
    symbolStats: Array.from(profile.symbolStats.values()).map(s => ({
      symbol: s.symbol,
      trades: s.trades,
      wins: s.wins,
      winRate: (s.winRate * 100).toFixed(1) + '%',
      avgProfit: s.avgProfit.toFixed(2) + '%',
    })),
  });
}
