import axios from 'axios';
import { CompanyRanking, RankingUpdate, EarningsData, AnalystData } from './types';

const UNUSUALWHALES_API = 'https://api.unusualwhales.com';
const PICKMYTRADE_API = 'https://api.pickmytrade.trade/v2';

export class RankingEngine {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getUpcomingEarnings(): Promise<EarningsData[]> {
    // Fetch companies with upcoming earnings in the next 30 days
    const response = await axios.get(
      `${UNUSUALWHALES_API}/earnings/upcoming`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        params: { days: 30 },
      }
    );
    return response.data.earnings || [];
  }

  private async getAnalystData(ticker: string): Promise<AnalystData | null> {
    try {
      const response = await axios.get(
        `${UNUSUALWHALES_API}/analyst/ratings/${ticker}`,
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );

      const data = response.data;
      const targetPrice = data.priceTarget || data.currentPrice;
      const undervalued = ((targetPrice - data.currentPrice) / data.currentPrice) * 100;

      return {
        undervaluedScore: Math.max(0, Math.min(100, 50 + undervalued * 2)),
        averageRating: data.consensus || 'hold',
        targetPrice,
        currentPrice: data.currentPrice,
      };
    } catch {
      return null;
    }
  }

  private async getTradeSignal(ticker: string): Promise<number> {
    try {
      // First try local webhook data
      const localResponse = await axios.get(
        `/api/webhook/trades?symbol=${ticker}`,
        { timeout: 1000 }
      ).catch(() => null);

      if (localResponse?.data) {
        const action = localResponse.data.action?.toLowerCase() || '';
        const signals: Record<string, number> = {
          'long': 85,
          'buy': 85,
          'short': 15,
          'sell': 15,
          'close': 50,
        };
        return signals[action] || 50;
      }

      // Fallback to pickmytrade API
      const response = await axios.get(
        `${PICKMYTRADE_API}/add-trade-data-latest`,
        { params: { symbol: ticker }, timeout: 3000 }
      );

      const data = response.data;
      if (!data || !data.signal) return 0;

      const signals: Record<string, number> = {
        'strong_buy': 95,
        'buy': 75,
        'hold': 50,
        'sell': 25,
        'strong_sell': 5,
      };

      return signals[data.signal.toLowerCase()] ||
             (data.strength ? Math.min(100, data.strength * 100) : 50);
    } catch {
      return 0;
    }
  }

  private calculateBeatProbability(
    ticker: string,
    historicalBeatRate: number,
    analystSentiment: number
  ): number {
    // Beat probability = historical beat rate + analyst sentiment boost
    const sentimentBoost = (analystSentiment - 50) * 0.3;
    return Math.max(0, Math.min(100, historicalBeatRate + sentimentBoost));
  }

  private calculateCompositeScore(
    analystScore: number,
    beatProbability: number,
    tradeSignal: number = 0
  ): number {
    // Weight: 35% analyst sentiment, 50% beat probability, 15% trade signal
    return analystScore * 0.35 + beatProbability * 0.5 + tradeSignal * 0.15;
  }

  async rankCompanies(): Promise<CompanyRanking[]> {
    const earnings = await this.getUpcomingEarnings();
    const rankings: CompanyRanking[] = [];

    for (const earning of earnings.slice(0, 50)) {
      const analyst = await this.getAnalystData(earning.ticker);
      if (!analyst) continue;

      const analystScore = analyst.undervaluedScore;
      const beatProb = this.calculateBeatProbability(
        earning.ticker,
        earning.historicalBeatRate,
        analystScore
      );
      const tradeSignal = await this.getTradeSignal(earning.ticker);
      const composite = this.calculateCompositeScore(analystScore, beatProb, tradeSignal);

      const now = new Date();
      const earningDate = new Date(earning.reportDate);
      const daysUntil = Math.ceil(
        (earningDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      rankings.push({
        ticker: earning.ticker,
        companyName: earning.companyName,
        earningsDate: earning.reportDate,
        daysUntilEarnings: daysUntil,
        analystSentiment: analystScore,
        beatProbability: beatProb,
        compositeScore: composite,
        analystConsensus: analyst.averageRating,
        priceTarget: analyst.targetPrice,
        currentPrice: analyst.currentPrice,
      });
    }

    return rankings
      .filter((r) => r.compositeScore > 60)
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }

  async getRanking(): Promise<RankingUpdate> {
    const rankings = await this.rankCompanies();
    return {
      timestamp: new Date().toISOString(),
      rankings,
      totalCount: rankings.length,
    };
  }
}
