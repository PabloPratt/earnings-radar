import { RankingEngine } from '@/lib/ranking-engine';
import { NextRequest, NextResponse } from 'next/server';

let cachedRanking: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const engine = new RankingEngine(process.env.UNUSUALWHALES_API_KEY || '');

export async function GET(request: NextRequest) {
  const now = Date.now();

  // Check if we have fresh cached data
  if (cachedRanking && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedRanking);
  }

  try {
    const ranking = await engine.getRanking();
    cachedRanking = ranking;
    lastFetchTime = now;
    return NextResponse.json(ranking);
  } catch (error) {
    console.error('Failed to fetch rankings:', error);
    // Return cached data or empty rankings instead of 500
    return NextResponse.json(
      cachedRanking || { timestamp: new Date().toISOString(), rankings: [], totalCount: 0 },
      { status: 200 }
    );
  }
}
