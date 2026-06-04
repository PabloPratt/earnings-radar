'use client';

import { useEffect, useState } from 'react';
import { CompanyRanking, RankingUpdate } from '@/lib/types';
import { SettingsPanel } from './SettingsPanel';
import { LearningProfile } from './LearningProfile';

export function RankingsDashboard() {
  const [rankings, setRankings] = useState<CompanyRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setError(null);
      const response = await fetch('/api/rankings');
      if (!response.ok) throw new Error('Failed to fetch rankings');

      const data: RankingUpdate = await response.json();
      setRankings(data.rankings);
      setLastUpdated(new Date(data.timestamp));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Earnings Radar</h1>
          <p className="text-gray-300">
            Real-time rankings of stocks with upcoming earnings, sorted by upside potential
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {rankings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No high-potential earnings candidates found at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Rank</th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Ticker</th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">Company</th>
                  <th className="text-right py-4 px-4 text-gray-300 font-semibold">Earnings</th>
                  <th className="text-right py-4 px-4 text-gray-300 font-semibold">Undervalued</th>
                  <th className="text-right py-4 px-4 text-gray-300 font-semibold">Beat Prob.</th>
                  <th className="text-right py-4 px-4 text-gray-300 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((ranking, index) => (
                  <tr
                    key={ranking.ticker}
                    className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-blue-400">#{index + 1}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-white font-semibold">
                      {ranking.ticker}
                    </td>
                    <td className="py-4 px-4 text-gray-200">{ranking.companyName}</td>
                    <td className="py-4 px-4 text-right text-gray-300">
                      <div className="text-sm">
                        {new Date(ranking.earningsDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {ranking.daysUntilEarnings}d away
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <ScoreBar
                        value={ranking.analystSentiment}
                        color="bg-green-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <ScoreBar
                        value={ranking.beatProbability}
                        color="bg-purple-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="font-bold text-lg text-white">
                        {ranking.compositeScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {ranking.analystConsensus?.toUpperCase() || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <LearningProfile />
      <SettingsPanel />
    </div>
  );
}

function ScoreBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="w-24 h-2 bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <span className="text-sm font-semibold text-white w-10 text-right">
        {value.toFixed(0)}%
      </span>
    </div>
  );
}
