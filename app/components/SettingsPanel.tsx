'use client';

import { useState } from 'react';

export function SettingsPanel() {
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText('https://earnings-radar-snowy.vercel.app/api/webhook/trades');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accounts = [
    { name: 'joseph pratt3508', token: 'EMIgWszWXTQZUrKWYAHm4A', status: '🟢 Active' },
    { name: 'joseph2 (MNQ1)', token: 'EMIgWszWXTQZUrKWYAHm4A', status: '🟢 Active' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl"
      >
        ⚙️
      </button>

      {showForm && (
        <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-96 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📊 My Accounts
          </h3>

          {/* Connected Accounts */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Connected to PickMyTrade
            </h4>
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.name}
                  className="flex items-start justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-green-900 dark:text-green-300">
                        {account.name}
                      </p>
                      <span className="text-xs">{account.status}</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      Token: {account.token.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              🔗 Webhook Configuration
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400 mb-2">
              Send Paradox Algo signals to this URL:
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-2 rounded mb-2">
              <code className="text-xs text-gray-800 dark:text-gray-200 flex-1 break-all">
                https://earnings-radar-snowy.vercel.app/api/webhook/trades
              </code>
              <button
                onClick={copyWebhookUrl}
                className="text-blue-600 hover:text-blue-800 text-sm font-bold whitespace-nowrap"
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Include your token & account info in the request body
            </p>
          </div>

          {/* Trader ID */}
          <div className="mt-4 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800 p-3">
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">
              👤 Your PickMyTrade ID
            </p>
            <p className="text-sm font-mono text-purple-700 dark:text-purple-400">
              18141
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
