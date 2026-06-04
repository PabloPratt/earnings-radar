export interface CompanyRanking {
  ticker: string;
  companyName: string;
  earningsDate: string;
  daysUntilEarnings: number;
  analystSentiment: number; // 0-100, higher = more undervalued
  beatProbability: number; // 0-100, likelihood of beating expectations
  compositeScore: number; // 0-100, final ranking score
  analystConsensus?: string; // "buy" | "hold" | "sell"
  currentPrice?: number;
  priceTarget?: number;
  peRatio?: number;
}

export interface RankingUpdate {
  timestamp: string;
  rankings: CompanyRanking[];
  totalCount: number;
}

export interface AnalystData {
  undervaluedScore: number;
  averageRating: string;
  targetPrice: number;
  currentPrice: number;
}

export interface EarningsData {
  ticker: string;
  companyName: string;
  reportDate: string;
  historicalBeatRate: number; // percentage
}
