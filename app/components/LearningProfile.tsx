'use client';

import { useEffect, useState } from 'react';

interface LearningStats {
  totalTrades: number;
  winRate: string;
  avgWinPercent: string;
  avgLossPercent: string;
  profitFactor: string;
  bestSymbol: string;
  bestTimeOfDay: string;
  preferredDuration: string;
}

interface SymbolStat {
  symbol: string;
  trades: number;
  wins: number;
  winRate: string;
  avgProfit: string;
}

export function LearningProfile() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [symbols, setSymbols] = useState<SymbolStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [traderName, setTraderName] = useState('Paradox Algo');

  useEffect(() => {
    // Get trader name from localStorage
    try {
      const trader = localStorage.getItem('followed_trader');
      if (trader) {
        const parsed = JSON.parse(trader);
        setTraderName(parsed.name);
      }
    } catch (e) {
      // Default to Paradox Algo
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/trades/analyze');
        const data = await response.json();
        setStats(data.profile);
        setSymbols(data.symbolStats.slice(0, 5)); // Top 5 symbols
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch learning profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
    const interval = setInterval(fetchProfile, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return null;

  if (stats.totalTrades === 0) {
    return (
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          📚 Learning from Paradox Algo trades... Send your first signal to start!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-lg border border-purple-200 dark:border-purple-800 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        📊 Learning from {traderName}
      </h2>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Trades</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalTrades}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Win Rate</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.winRate}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Profit Factor</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.profitFactor}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">Best Time</p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {stats.bestTimeOfDay}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Trade Performance
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Win</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{stats.avgWinPercent}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Loss</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {stats.avgLossPercent}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Duration</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {stats.preferredDuration}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            💡 How Learning Works
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Every trade Paradox sends is analyzed. Symbols with high win rates get boosted in the earnings radar. This creates a feedback loop where your best trades get highlighted.
          </p>
        </div>
      </div>

      {/* Top Symbols */}
      {symbols.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            ⭐ Best Performing Symbols
          </h3>
          <div className="space-y-2">
            {symbols.map((sym) => (
              <div
                key={sym.symbol}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {sym.symbol}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {sym.trades} trades • {sym.wins}W
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {sym.winRate}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    +{sym.avgProfit} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        🔄 Updates every 5 minutes • More data = Better learning
      </p>
    </div>
  );
}
