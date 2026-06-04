import { NextRequest, NextResponse } from 'next/server';

// In-memory store for latest trade signals (use Redis in production)
const tradeSignals: Map<string, any> = new Map();
const authorizedTokens = new Set(
  process.env.TRADOVATE_TOKENS?.split(',').map(t => t.trim()) || []
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate token
    const token = data.token || '';
    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 401 }
      );
    }

    // Check if token is authorized (if env var is set)
    if (process.env.TRADOVATE_TOKENS && !authorizedTokens.has(token)) {
      return NextResponse.json(
        { error: 'Unauthorized token' },
        { status: 401 }
      );
    }

    // Extract symbol from data (handle MNQ1! format)
    const symbol = (data.symbol || '').replace(/[!~]/g, '').trim();
    if (!symbol) {
      return NextResponse.json(
        { error: 'Missing or invalid symbol' },
        { status: 400 }
      );
    }

    // Store trade signal with timestamp and account info
    tradeSignals.set(symbol, {
      action: data.data || data.action || 'unknown',
      quantity: data.quantity || 0,
      price: data.price || 0,
      timestamp: new Date().toISOString(),
      account_id: data.multiple_accounts?.[0]?.account_id || 'unknown',
      accounts: data.multiple_accounts || [],
      rawData: data,
    });

    return NextResponse.json({
      status: 'ok',
      symbol,
      action: data.data || data.action,
      account_id: data.multiple_accounts?.[0]?.account_id || 'unknown',
      stored: true,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');

  if (symbol) {
    const signal = tradeSignals.get(symbol);
    return NextResponse.json(signal || null);
  }

  // Return all signals
  return NextResponse.json(
    Object.fromEntries(tradeSignals)
  );
}
