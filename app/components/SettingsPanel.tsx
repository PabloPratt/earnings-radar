'use client';

import { useState } from 'react';

interface Account {
  id: string;
  name: string;
  token: string;
}

export function SettingsPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccount, setNewAccount] = useState({ name: '', token: '' });
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const addAccount = () => {
    if (newAccount.name && newAccount.token) {
      const account = {
        id: Date.now().toString(),
        ...newAccount,
      };
      const updatedAccounts = [...accounts, account];
      setAccounts(updatedAccounts);
      localStorage.setItem('tradovate_accounts', JSON.stringify(updatedAccounts));
      setNewAccount({ name: '', token: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const removeAccount = (id: string) => {
    const updatedAccounts = accounts.filter(a => a.id !== id);
    setAccounts(updatedAccounts);
    localStorage.setItem('tradovate_accounts', JSON.stringify(updatedAccounts));
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl"
      >
        ⚙️
      </button>

      {showForm && (
        <div className="absolute bottom-20 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Tradovate Accounts
          </h3>

          {/* Add Account Form */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              placeholder="Account Name (e.g., Trading Account 1)"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
            />
            <input
              type="password"
              placeholder="API Token"
              value={newAccount.token}
              onChange={(e) => setNewAccount({ ...newAccount, token: e.target.value })}
              className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
            />
            <button
              onClick={addAccount}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium"
            >
              Add Account
            </button>
            {saved && (
              <p className="text-green-600 dark:text-green-400 text-sm mt-2">✓ Saved!</p>
            )}
          </div>

          {/* Connected Accounts */}
          {accounts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Connected Accounts ({accounts.length})
              </h4>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-300">
                        {account.name}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Token: {account.token.substring(0, 8)}...
                      </p>
                    </div>
                    <button
                      onClick={() => removeAccount(account.id)}
                      className="ml-2 text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Webhook Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
              📡 Webhook URL
            </p>
            <code className="text-xs text-blue-800 dark:text-blue-400 break-all">
              https://earnings-radar-snowy.vercel.app/api/webhook/trades
            </code>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Send your Tradovate orders here with your token & account name.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
