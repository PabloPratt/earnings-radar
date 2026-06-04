'use client';

import { useState } from 'react';

export function FollowTrader() {
  const [traderToken, setTraderToken] = useState('');
  const [traderName, setTraderName] = useState('');
  const [following, setFollowing] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const saveTrader = () => {
    if (traderToken && traderName) {
      const trader = { token: traderToken, name: traderName };
      localStorage.setItem('followed_trader', JSON.stringify(trader));
      setFollowing(trader);
      setTraderToken('');
      setTraderName('');
    }
  };

  const stopFollowing = () => {
    localStorage.removeItem('followed_trader');
    setFollowing(null);
  };

  const copyWebhookUrl = () => {
    const url = 'https://earnings-radar-snowy.vercel.app/api/webhook/trades';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-8 right-8 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          👥 Follow a Trader
        </h3>

        {!following ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Trader's Name (e.g., Friend's Account)"
              value={traderName}
              onChange={(e) => setTraderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="password"
              placeholder="Their API Token"
              value={traderToken}
              onChange={(e) => setTraderToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
            />
            <button
              onClick={saveTrader}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm"
            >
              Follow Trader
            </button>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                📝 Share This with Your Friend
              </p>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <code className="text-xs text-gray-800 dark:text-gray-200 flex-1 break-all">
                  earnings-radar-snowy.vercel.app/api/webhook/trades
                </code>
                <button
                  onClick={copyWebhookUrl}
                  className="text-blue-600 hover:text-blue-800 text-sm font-bold whitespace-nowrap"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                Your friend sends their Paradox signals here with their token
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                ✓ Following
              </p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-1">
                {following.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Token: {following.token.substring(0, 8)}...
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-300">
                📊 Their trades appear on your dashboard & boost your earnings radar
              </p>
            </div>

            <button
              onClick={stopFollowing}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-medium text-sm"
            >
              Stop Following
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
