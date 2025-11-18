export interface Asset {
  id: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface WatchlistItem {
    ticker: string;
    name: string;
    countryCode?: string;
    currencyCode: string;
}

export interface Currency {
  code: string;
  name: string;
}

export interface KeyMetrics {
  marketSentiment: 'Bullish' | 'Bearish' | 'Neutral' | string;
  volatilityIndex: number;
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  growthPotential: 'Low' | 'Medium' | 'High' | string;
  cagr5y: number;
}

export interface AnalysisResult {
  overview: string;
  newsAnalysis: string;
  investmentOutlook: string;
  keyMetrics: KeyMetrics;
}

export interface StockFundamentals {
    peRatio: number | string;
    pbRatio: number | string;
    sectorPe: number | string;
    eps: number | string;
    dividendYield: number | string;
    beta: number | string;
    roi: number | string;
    cagr5y: number | string;
}

export interface StockTechnicals {
    '52WeekHigh': number;
    '52WeekLow': number;
    movingAverage50Day: number;
    movingAverage200Day: number;
    rsi: number;
    supportLevel: number;
    resistanceLevel: number;
}

export interface StockBalanceSheet {
    totalAssets: string;
    totalLiabilities: string;
    totalEquity: string;
    debtToEquityRatio: number;
    currentRatio: number;
}

export interface StockPNL {
    totalRevenue: string;
    grossProfit: string;
    netIncome: string;
    ebitda: string;
    netProfitMargin: number;
}

export interface Stakeholder {
    name: string;
    shares: string;
    percentage: number;
}

export interface StockAISummary {
    trend: 'Bullish' | 'Bearish' | 'Sideways';
    momentum: 'Strong' | 'Weak' | 'Neutral';
    volatility: 'Low' | 'Medium' | 'High';
    riskLevel: 'Low' | 'Medium' | 'High';
}

export interface StockAnalysisResult {
    overview: string;
    newsAnalysis: string;
    investmentOutlook: string;
    marketSentiment: 'Bullish' | 'Bearish' | 'Neutral' | string;
    fundamentals: StockFundamentals;
    technicals: StockTechnicals;
    balanceSheet: StockBalanceSheet;
    pnl: StockPNL;
    stakeholders: Stakeholder[];
    aiSummary: StockAISummary;
}

export interface Tokenomics {
    marketCap: string;
    circulatingSupply: string;
    totalSupply: string;
    maxSupply: string;
    tradingVolume24h: string;
}

export interface OnChainMetrics {
    activeAddresses: string;
    transactionCount24h: string;
    totalValueLocked: string;
    hashRate: string;
}

export interface CryptoAnalysisResult {
    overview: string;
    newsAnalysis: string;
    investmentOutlook: string;
    marketSentiment: 'Bullish' | 'Bearish' | 'Neutral' | string;
    tokenomics: Tokenomics;
    onChainMetrics: OnChainMetrics;
    aiSummary: StockAISummary;
}


export interface ScreenerStock {
    ticker: string;
    name: string;
    change: string;
    reason: string;
}

export interface StockScreenerResult {
    topGainers: ScreenerStock[];
    topLosers: ScreenerStock[];
    highVolume: ScreenerStock[];
    overboughtRSI: ScreenerStock[];
    oversoldRSI: ScreenerStock[];
}

export interface CryptoScreenerResult {
    topGainers: ScreenerStock[];
    topLosers: ScreenerStock[];
    trending: ScreenerStock[];
    newlyListed: ScreenerStock[];
}

export type ScreenerResult = StockScreenerResult | CryptoScreenerResult;


export interface AssetRealTimeInfo {
    ticker: string;
    price: number;
    change: number;
    changePercent: number;
}

export interface HistoricalDataPoint {
    date: string; // "YYYY-MM-DD"
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}