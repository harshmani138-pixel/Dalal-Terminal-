import { AnalysisResult, KeyMetrics, StockAnalysisResult, StockScreenerResult, CryptoScreenerResult, AssetRealTimeInfo, HistoricalDataPoint, CryptoAnalysisResult } from '../types';

let ai: any;
const getAI = async () => {
    if (!ai) {
        const { GoogleGenAI } = await import('@google/genai');
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};
const model = 'gemini-2.5-flash';

const generateContent = async (prompt: string) => {
    const aiClient = await getAI();
    const response = await aiClient.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
};

const generateJsonContent = async (prompt: string, schema: object): Promise<any> => {
    try {
        const aiClient = await getAI();
        const response = await aiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error parsing JSON response from Gemini:", error);
        throw new Error("Failed to parse structured data from AI response.");
    }
};

export const createChat = async (assetName: string, assetType: string): Promise<any> => {
    const aiClient = await getAI();
    const chat = aiClient.chats.create({
        model,
        config: {
            systemInstruction: `You are a world-class financial analyst AI named MarketLens Pro. Your user is asking questions about the ${assetType} '${assetName}'. Provide expert, concise, and helpful answers. Use markdown for formatting when appropriate.`,
        },
    });
    return chat;
};

export const generateMarketAnalysis = async (countryName: string, assetName: string): Promise<AnalysisResult> => {
    const keyMetricsSchema = {
        type: 'OBJECT',
        properties: {
            marketSentiment: { type: 'STRING', enum: ['Bullish', 'Bearish', 'Neutral'] },
            volatilityIndex: { type: 'NUMBER', description: 'A value between 0 and 100' },
            riskLevel: { type: 'STRING', enum: ['Low', 'Medium', 'High'] },
            growthPotential: { type: 'STRING', enum: ['Low', 'Medium', 'High'] },
            cagr5y: { type: 'NUMBER', description: 'The 5-year Compound Annual Growth Rate as a percentage' },
        },
        required: ['marketSentiment', 'volatilityIndex', 'riskLevel', 'growthPotential', 'cagr5y'],
    };

    const overviewPrompt = `Generate a concise market overview for ${assetName} in ${countryName}. Cover the current situation, key drivers, and recent performance. Format as a single, detailed paragraph.`;
    const newsAnalysisPrompt = `Analyze the top 3-5 most impactful domestic and international financial news stories for ${assetName} in ${countryName} from the last week. For each story, provide a brief summary and its potential market impact. Use markdown for formatting, with bold headings for each news story.`;
    const investmentOutlookPrompt = `Provide a balanced investment outlook for ${assetName} in ${countryName} for the next 6-12 months. Discuss potential opportunities, risks, and key factors to watch. Structure your response with three distinct sections using markdown headings: '### Bull Case', '### Bear Case', and '### Neutral Outlook'.`;
    const keyMetricsPrompt = `Generate key metrics for the ${assetName} market in ${countryName}.`;

    try {
        const [overview, newsAnalysis, investmentOutlook, keyMetrics] = await Promise.all([
            generateContent(overviewPrompt),
            generateContent(newsAnalysisPrompt),
            generateContent(investmentOutlookPrompt),
            generateJsonContent(keyMetricsPrompt, keyMetricsSchema) as Promise<KeyMetrics>,
        ]);

        return { overview, newsAnalysis, investmentOutlook, keyMetrics };

    } catch (error) {
        console.error("Failed to generate market analysis:", error);
        throw new Error("An error occurred while fetching analysis from the AI. Please try again.");
    }
};

export const generateStockAnalysis = async (countryName: string, stockTicker: string, currencyCode: string): Promise<StockAnalysisResult> => {
    const stockAnalysisSchema = {
        type: 'OBJECT',
        properties: {
            aiSummary: {
                type: 'OBJECT',
                properties: {
                    trend: { type: 'STRING', enum: ['Bullish', 'Bearish', 'Sideways'], description: "The current price trend direction." },
                    momentum: { type: 'STRING', enum: ['Strong', 'Weak', 'Neutral'], description: "The strength of the current price momentum." },
                    volatility: { type: 'STRING', enum: ['Low', 'Medium', 'High'], description: "The stock's current price volatility." },
                    riskLevel: { type: 'STRING', enum: ['Low', 'Medium', 'High'], description: "The overall risk level associated with the stock." },
                },
                required: ['trend', 'momentum', 'volatility', 'riskLevel']
            },
            marketSentiment: { type: 'STRING', enum: ['Bullish', 'Bearish', 'Neutral'], description: "The overall market sentiment for the stock." },
            fundamentals: {
                type: 'OBJECT',
                properties: {
                    peRatio: { type: 'NUMBER' },
                    pbRatio: { type: 'NUMBER' },
                    sectorPe: { type: 'NUMBER' },
                    eps: { type: 'NUMBER' },
                    dividendYield: { type: 'NUMBER' },
                    beta: { type: 'NUMBER' },
                    roi: { type: 'NUMBER', description: 'Return on Investment as a percentage' },
                    cagr5y: { type: 'NUMBER', description: '5-year Compound Annual Growth Rate as a percentage' },
                },
                required: ['peRatio', 'pbRatio', 'sectorPe', 'eps', 'dividendYield', 'beta', 'roi', 'cagr5y']
            },
            technicals: {
                type: 'OBJECT',
                properties: {
                    '52WeekHigh': { type: 'NUMBER' },
                    '52WeekLow': { type: 'NUMBER' },
                    movingAverage50Day: { type: 'NUMBER' },
                    movingAverage200Day: { type: 'NUMBER' },
                    rsi: { type: 'NUMBER' },
                    supportLevel: { type: 'NUMBER' },
                    resistanceLevel: { type: 'NUMBER' },
                },
                required: ['52WeekHigh', '52WeekLow', 'movingAverage50Day', 'movingAverage200Day', 'rsi', 'supportLevel', 'resistanceLevel']
            },
            balanceSheet: {
                type: 'OBJECT',
                properties: {
                    totalAssets: { type: 'STRING', description: "Total assets as a string in the requested currency" },
                    totalLiabilities: { type: 'STRING', description: "Total liabilities as a string in the requested currency" },
                    totalEquity: { type: 'STRING', description: "Total equity as a string in the requested currency" },
                    debtToEquityRatio: { type: 'NUMBER' },
                    currentRatio: { type: 'NUMBER' },
                },
                required: ['totalAssets', 'totalLiabilities', 'totalEquity', 'debtToEquityRatio', 'currentRatio']
            },
            pnl: {
                type: 'OBJECT',
                properties: {
                    totalRevenue: { type: 'STRING', description: "Total revenue as a string in the requested currency" },
                    grossProfit: { type: 'STRING', description: "Gross profit as a string in the requested currency" },
                    netIncome: { type: 'STRING', description: "Net income as a string in the requested currency" },
                    ebitda: { type: 'STRING', description: "EBITDA as a string in the requested currency" },
                    netProfitMargin: { type: 'NUMBER', description: "Net profit margin as a percentage" },
                },
                required: ['totalRevenue', 'grossProfit', 'netIncome', 'ebitda', 'netProfitMargin']
            },
            stakeholders: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        name: { type: 'STRING', description: "Name of the stakeholder" },
                        shares: { type: 'STRING', description: "Number of shares held as a string (e.g., '1.7B')" },
                        percentage: { type: 'NUMBER', description: "Shareholding percentage" },
                    },
                    required: ['name', 'shares', 'percentage'],
                }
            }
        },
        required: ['aiSummary', 'marketSentiment', 'fundamentals', 'technicals', 'balanceSheet', 'pnl', 'stakeholders']
    };

    const overviewPrompt = `Generate a concise company overview for ${stockTicker} (${countryName}). Describe its business, market position, and recent strategic developments. Format as a single, detailed paragraph.`;
    const newsAnalysisPrompt = `Analyze the top 3-5 most impactful recent news stories for the stock ${stockTicker}. For each story, provide a brief summary and its potential impact on the stock price. Use markdown for formatting, with bold headings for each news story.`;
    const investmentOutlookPrompt = `Provide a balanced investment outlook for ${stockTicker} for the next 6-12 months. Discuss potential opportunities, risks, and key factors to watch. Structure your response with three distinct sections using markdown headings: '### Bull Case', '### Bear Case', and '### Neutral Outlook'.`;
    const structuredDataPrompt = `Generate a detailed financial and technical report for the stock ${stockTicker} (${countryName}). All monetary values must be in ${currencyCode}. Provide:
1.  An AI-based summary including trend direction, momentum strength, volatility, and overall risk level.
2.  The overall market sentiment.
3.  Key fundamental metrics.
4.  Key technical indicators.
5.  Key metrics from the latest balance sheet and profit & loss statement.
6.  A list of the top 10 stakeholders.`;

    try {
        const [overview, newsAnalysis, investmentOutlook, structuredData] = await Promise.all([
            generateContent(overviewPrompt),
            generateContent(newsAnalysisPrompt),
            generateContent(investmentOutlookPrompt),
            generateJsonContent(structuredDataPrompt, stockAnalysisSchema),
        ]);

        return {
            overview,
            newsAnalysis,
            investmentOutlook,
            marketSentiment: structuredData.marketSentiment,
            fundamentals: structuredData.fundamentals,
            technicals: structuredData.technicals,
            balanceSheet: structuredData.balanceSheet,
            pnl: structuredData.pnl,
            stakeholders: structuredData.stakeholders,
            aiSummary: structuredData.aiSummary,
        };

    } catch (error) {
        console.error("Failed to generate stock analysis:", error);
        throw new Error("An error occurred while fetching stock analysis from the AI. Please try again.");
    }
}

export const generateCryptoAnalysis = async (cryptoTicker: string, currencyCode: string): Promise<CryptoAnalysisResult> => {
    const cryptoAnalysisSchema = {
        type: 'OBJECT',
        properties: {
            aiSummary: {
                type: 'OBJECT',
                properties: {
                    trend: { type: 'STRING', enum: ['Bullish', 'Bearish', 'Sideways'], description: "The current price trend direction." },
                    momentum: { type: 'STRING', enum: ['Strong', 'Weak', 'Neutral'], description: "The strength of the current price momentum." },
                    volatility: { type: 'STRING', enum: ['Low', 'Medium', 'High'], description: "The crypto's current price volatility." },
                    riskLevel: { type: 'STRING', enum: ['Low', 'Medium', 'High'], description: "The overall risk level associated with the crypto." },
                },
                required: ['trend', 'momentum', 'volatility', 'riskLevel']
            },
            marketSentiment: { type: 'STRING', enum: ['Bullish', 'Bearish', 'Neutral'], description: "The overall market sentiment for the cryptocurrency." },
            tokenomics: {
                type: 'OBJECT',
                properties: {
                    marketCap: { type: 'STRING', description: "Market capitalization in the requested currency." },
                    circulatingSupply: { type: 'STRING', description: "Current circulating supply." },
                    totalSupply: { type: 'STRING', description: "Total supply." },
                    maxSupply: { type: 'STRING', description: "Maximum possible supply." },
                    tradingVolume24h: { type: 'STRING', description: "24-hour trading volume in the requested currency." },
                },
                required: ['marketCap', 'circulatingSupply', 'totalSupply', 'maxSupply', 'tradingVolume24h']
            },
            onChainMetrics: {
                type: 'OBJECT',
                properties: {
                    activeAddresses: { type: 'STRING', description: "Number of unique active addresses in the last 24 hours." },
                    transactionCount24h: { type: 'STRING', description: "Number of transactions in the last 24 hours." },
                    totalValueLocked: { type: 'STRING', description: "Total Value Locked (TVL) in the requested currency, if applicable." },
                    hashRate: { type: 'STRING', description: "The network's hash rate, if applicable." },
                },
                required: ['activeAddresses', 'transactionCount24h', 'totalValueLocked', 'hashRate']
            }
        },
        required: ['aiSummary', 'marketSentiment', 'tokenomics', 'onChainMetrics']
    };

    const overviewPrompt = `Generate a concise overview for the cryptocurrency ${cryptoTicker}. Describe its purpose, technology, and market position. Format as a single, detailed paragraph.`;
    const newsAnalysisPrompt = `Analyze the top 3-5 most impactful recent news stories for ${cryptoTicker}. For each story, provide a brief summary and its potential impact on the price. Use markdown for formatting, with bold headings for each news story.`;
    const investmentOutlookPrompt = `Provide a balanced investment outlook for ${cryptoTicker} for the next 6-12 months. Discuss potential opportunities, risks, and key factors to watch. Structure your response with three distinct sections using markdown headings: '### Bull Case', '### Bear Case', and '### Neutral Outlook'.`;
    const structuredDataPrompt = `Generate a detailed report for the cryptocurrency ${cryptoTicker}. All monetary values must be in ${currencyCode}. Provide:
1.  An AI-based summary including trend direction, momentum strength, volatility, and overall risk level.
2.  The overall market sentiment.
3.  Key tokenomics data.
4.  Key on-chain metrics.`;

    try {
        const [overview, newsAnalysis, investmentOutlook, structuredData] = await Promise.all([
            generateContent(overviewPrompt),
            generateContent(newsAnalysisPrompt),
            generateContent(investmentOutlookPrompt),
            generateJsonContent(structuredDataPrompt, cryptoAnalysisSchema),
        ]);

        return {
            overview,
            newsAnalysis,
            investmentOutlook,
            marketSentiment: structuredData.marketSentiment,
            tokenomics: structuredData.tokenomics,
            onChainMetrics: structuredData.onChainMetrics,
            aiSummary: structuredData.aiSummary,
        };

    } catch (error) {
        console.error(`Failed to generate crypto analysis for ${cryptoTicker}:`, error);
        throw new Error("An error occurred while fetching crypto analysis from the AI. Please try again.");
    }
};


export const getHistoricalAssetData = async (ticker: string): Promise<HistoricalDataPoint[]> => {
    const historicalDataPointSchema = {
        type: 'OBJECT',
        properties: {
            date: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
            open: { type: 'NUMBER' },
            high: { type: 'NUMBER' },
            low: { type: 'NUMBER' },
            close: { type: 'NUMBER' },
        },
        required: ['date', 'open', 'high', 'low', 'close'],
    };

    const historicalDataSchema = {
        type: 'ARRAY',
        items: historicalDataPointSchema,
    };

    const prompt = `Provide daily historical price data for the last 365 days for the asset ${ticker}. Include date (in "YYYY-MM-DD" format), open, high, low, and close price. Make sure the data is sorted by date in ascending order.`;

    try {
        return await generateJsonContent(prompt, historicalDataSchema);
    } catch (error) {
        console.error(`Failed to generate historical data for ${ticker}:`, error);
        return [];
    }
};

export const generateMarketScreener = async (countryName: string): Promise<StockScreenerResult> => {
    const screenerStockSchema = {
        type: 'OBJECT',
        properties: {
            ticker: { type: 'STRING' },
            name: { type: 'STRING' },
            change: { type: 'STRING', description: "The price change, formatted as a percentage string (e.g., '+2.5%')." },
            reason: { type: 'STRING', description: "A brief, AI-generated reason for the asset's movement." },
        },
        required: ['ticker', 'name', 'change', 'reason'],
    };

    const stockScreenerSchema = {
        type: 'OBJECT',
        properties: {
            topGainers: { type: 'ARRAY', items: screenerStockSchema },
            topLosers: { type: 'ARRAY', items: screenerStockSchema },
            highVolume: { type: 'ARRAY', items: screenerStockSchema },
            overboughtRSI: { type: 'ARRAY', items: screenerStockSchema, description: "Stocks with RSI > 70" },
            oversoldRSI: { type: 'ARRAY', items: screenerStockSchema, description: "Stocks with RSI < 30" },
        },
        required: ['topGainers', 'topLosers', 'highVolume', 'overboughtRSI', 'oversoldRSI'],
    };

    const prompt = `Generate a stock screener for the stock market in ${countryName}. Provide 5 stocks for each of the following categories for today's market:
- Top Gainers
- Top Losers
- High Volume movers
- Overbought (RSI > 70)
- Oversold (RSI < 30)

For each stock, include its ticker, full name, percentage change, and a very brief reason for its status.`;

    try {
        return await generateJsonContent(prompt, stockScreenerSchema);
    } catch (error) {
        console.error("Failed to generate market screener:", error);
        throw new Error("An error occurred while fetching market screener data from the AI. Please try again.");
    }
};

export const generateCryptoScreener = async (): Promise<CryptoScreenerResult> => {
    const screenerStockSchema = {
        type: 'OBJECT',
        properties: {
            ticker: { type: 'STRING' },
            name: { type: 'STRING' },
            change: { type: 'STRING', description: "The price change, formatted as a percentage string (e.g., '+2.5%')." },
            reason: { type: 'STRING', description: "A brief, AI-generated reason for the asset's movement." },
        },
        required: ['ticker', 'name', 'change', 'reason'],
    };

    const cryptoScreenerSchema = {
        type: 'OBJECT',
        properties: {
            topGainers: { type: 'ARRAY', items: screenerStockSchema },
            topLosers: { type: 'ARRAY', items: screenerStockSchema },
            trending: { type: 'ARRAY', items: screenerStockSchema, description: "Coins with high social media or trading volume buzz." },
            newlyListed: { type: 'ARRAY', items: screenerStockSchema, description: "Recently listed coins on major exchanges." },
        },
        required: ['topGainers', 'topLosers', 'trending', 'newlyListed'],
    };

    const prompt = `Generate a cryptocurrency screener for today's market. Provide 5 coins for each of the following categories:
- Top Gainers
- Top Losers
- Trending (high social and trade volume)
- Newly Listed (on major exchanges)

For each coin, include its ticker (e.g., BTC), full name, percentage change, and a very brief reason for its status.`;

    try {
        return await generateJsonContent(prompt, cryptoScreenerSchema);
    } catch (error) {
        console.error("Failed to generate crypto screener:", error);
        throw new Error("An error occurred while fetching crypto screener data from the AI. Please try again.");
    }
};


export const getRealTimeAssetData = async (tickers: string[]): Promise<AssetRealTimeInfo[]> => {
    if (tickers.length === 0) return [];

    const assetRealTimeInfoSchema = {
        type: 'OBJECT',
        properties: {
            ticker: { type: 'STRING' },
            price: { type: 'NUMBER' },
            change: { type: 'NUMBER' },
            changePercent: { type: 'NUMBER', description: "Percentage change" },
        },
        required: ['ticker', 'price', 'change', 'changePercent'],
    };
    
    const prompt = `Provide the current real-time price for the following asset tickers: ${tickers.join(', ')}. Include the ticker, latest price, the absolute price change, and the percentage change from the previous close.`;

    try {
        return await generateJsonContent(prompt, { 
            type: 'ARRAY',
            items: assetRealTimeInfoSchema
        });
    } catch (error) {
        console.error("Failed to generate real-time asset data:", error);
        return [];
    }
};