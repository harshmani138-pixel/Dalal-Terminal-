import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OrderPanel from './components/OrderPanel';
import MarketScreener from './components/MarketScreener';
import AISummary from './components/AISummary';
import AnalysisCard from './components/AnalysisCard';
import { ChartBarIcon, NewspaperIcon, LightBulbIcon, CurrencyDollarIcon } from './components/icons';
import { MemoizedGoogleChart } from './components/GoogleChart';
import { COUNTRIES, COUNTRY_CURRENCY_MAP, WATCHLIST_STOCKS, CRYPTO_WATCHLIST } from './constants';
import { generateStockAnalysis, generateCryptoAnalysis, getHistoricalAssetData, getRealTimeAssetData, createChat } from './services/geminiService';
import { StockAnalysisResult, CryptoAnalysisResult, WatchlistItem, Stakeholder, HistoricalDataPoint, AssetRealTimeInfo } from './types';
import { marked } from 'marked';

const isStockAnalysis = (result: any): result is StockAnalysisResult => {
    return result && 'fundamentals' in result;
};

const DataGrid: React.FC<{ title: string; data: Record<string, string | number> }> = ({ title, data }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4 text-brand-text-primary">{title}</h3>
        <div className="space-y-1">
            {Object.entries(data).map(([key, value], index) => (
                <div 
                    key={key} 
                    className={`flex justify-between items-center p-3 rounded-md transition-colors duration-150 ${index % 2 !== 0 ? 'bg-brand-bg' : ''} hover:bg-brand-border/30`}
                >
                    <p className="text-sm text-brand-text-secondary">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-sm text-brand-text-primary font-semibold text-right">{String(value)}</p>
                </div>
            ))}
        </div>
    </div>
);

const StakeholdersTable: React.FC<{ stakeholders: Stakeholder[] }> = ({ stakeholders }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-brand-text-secondary uppercase">
                    <tr>
                        <th scope="col" className="px-4 py-3">Stakeholder Name</th>
                        <th scope="col" className="px-4 py-3 text-right">Shares Held</th>
                        <th scope="col" className="px-4 py-3 text-right">Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {stakeholders?.map((stakeholder, index) => (
                        <tr key={index} className="border-b border-brand-border even:bg-brand-bg hover:bg-brand-border/30 transition-colors duration-150">
                            <td className="px-4 py-4 font-medium text-brand-text-primary whitespace-nowrap">{stakeholder.name}</td>
                            <td className="px-4 py-4 text-right">{stakeholder.shares}</td>
                            <td className="px-4 py-4 text-right">{stakeholder.percentage?.toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AnalysisTabs: React.FC<{ result: StockAnalysisResult | CryptoAnalysisResult, currency: string }> = ({ result, currency }) => {
    const [activeTab, setActiveTab] = useState('summary');

    const formatNumber = (value?: number | string) => {
        if (typeof value === 'number') return value.toLocaleString();
        if (typeof value === 'string') return value;
        return 'N/A';
    }

    const STOCK_TABS = { summary: 'Summary', financials: 'Financials', analysis: 'Analysis', stakeholders: 'Stakeholders' };
    const CRYPTO_TABS = { summary: 'Summary', tokenomics: 'Tokenomics', onchain: 'On-chain' };
    
    const TABS = isStockAnalysis(result) ? STOCK_TABS : CRYPTO_TABS;

    const renderContent = () => {
        if (activeTab === 'summary') {
            return (
                <div className="space-y-6">
                    <AnalysisCard title="Overview" icon={<ChartBarIcon className="w-5 h-5" />} isLoading={false}>
                        <p className="text-brand-text-primary leading-relaxed">{result.overview}</p>
                    </AnalysisCard>
                    <AnalysisCard title="Investment Outlook" icon={<LightBulbIcon className="w-5 h-5" />} isLoading={false}>
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(result.investmentOutlook) }} />
                    </AnalysisCard>
                    <AnalysisCard title="Recent News Analysis" icon={<NewspaperIcon className="w-5 h-5" />} isLoading={false}>
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(result.newsAnalysis) }} />
                    </AnalysisCard>
                </div>
            );
        }

        if (isStockAnalysis(result)) {
            switch (activeTab) {
                case 'financials':
                    const formattedBalanceSheet = {
                        'Total Assets': result.balanceSheet.totalAssets ? `${result.balanceSheet.totalAssets} ${currency}` : 'N/A',
                        'Total Liabilities': result.balanceSheet.totalLiabilities ? `${result.balanceSheet.totalLiabilities} ${currency}` : 'N/A',
                        'Total Equity': result.balanceSheet.totalEquity ? `${result.balanceSheet.totalEquity} ${currency}` : 'N/A',
                        'Debt to Equity': result.balanceSheet.debtToEquityRatio?.toFixed(2) || 'N/A',
                        'Current Ratio': result.balanceSheet.currentRatio?.toFixed(2) || 'N/A',
                    };
                    const formattedPNL = {
                        'Total Revenue': result.pnl.totalRevenue ? `${result.pnl.totalRevenue} ${currency}` : 'N/A',
                        'Gross Profit': result.pnl.grossProfit ? `${result.pnl.grossProfit} ${currency}` : 'N/A',
                        'Net Income': result.pnl.netIncome ? `${result.pnl.netIncome} ${currency}` : 'N/A',
                        'EBITDA': result.pnl.ebitda ? `${result.pnl.ebitda} ${currency}` : 'N/A',
                        'Net Profit Margin': result.pnl.netProfitMargin ? `${result.pnl.netProfitMargin.toFixed(2)}%` : 'N/A',
                    };
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DataGrid title="Balance Sheet (Key Metrics)" data={formattedBalanceSheet} />
                            <DataGrid title="Profit & Loss (Key Metrics)" data={formattedPNL} />
                        </div>
                    );
                case 'analysis':
                    const formattedFundamentals = {
                        'P/E Ratio': formatNumber(result.fundamentals.peRatio), 'P/B Ratio': formatNumber(result.fundamentals.pbRatio),
                        'Sector P/E': formatNumber(result.fundamentals.sectorPe), 'EPS': result.fundamentals.eps ? `${formatNumber(result.fundamentals.eps)} ${currency}` : 'N/A',
                        'Dividend Yield': result.fundamentals.dividendYield ? `${formatNumber(result.fundamentals.dividendYield)}%` : 'N/A', 'Beta': formatNumber(result.fundamentals.beta),
                        'ROI': result.fundamentals.roi ? `${formatNumber(result.fundamentals.roi)}%` : 'N/A', '5Y CAGR': result.fundamentals.cagr5y ? `${formatNumber(result.fundamentals.cagr5y)}%` : 'N/A',
                    };
                    const formattedTechnicals = {
                        '52 Week High': result.technicals['52WeekHigh'] ? `${formatNumber(result.technicals['52WeekHigh'])} ${currency}` : 'N/A',
                        '52 Week Low': result.technicals['52WeekLow'] ? `${formatNumber(result.technicals['52WeekLow'])} ${currency}` : 'N/A',
                        '50-Day MA': result.technicals.movingAverage50Day ? `${formatNumber(result.technicals.movingAverage50Day)} ${currency}` : 'N/A',
                        '200-Day MA': result.technicals.movingAverage200Day ? `${formatNumber(result.technicals.movingAverage200Day)} ${currency}` : 'N/A',
                        'RSI': formatNumber(result.technicals.rsi), 'Support': result.technicals.supportLevel ? `${formatNumber(result.technicals.supportLevel)} ${currency}` : 'N/A',
                        'Resistance': result.technicals.resistanceLevel ? `${formatNumber(result.technicals.resistanceLevel)} ${currency}` : 'N/A',
                    };
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DataGrid title="Fundamental Analysis" data={formattedFundamentals} />
                            <DataGrid title="Technical Analysis" data={formattedTechnicals} />
                        </div>
                    );
                case 'stakeholders':
                    return <StakeholdersTable stakeholders={result.stakeholders} />;
            }
        } else {
            switch (activeTab) {
                case 'tokenomics':
                    const formattedTokenomics = {
                        'Market Cap': `${result.tokenomics.marketCap} ${currency}`, '24h Trading Volume': `${result.tokenomics.tradingVolume24h} ${currency}`,
                        'Circulating Supply': result.tokenomics.circulatingSupply, 'Total Supply': result.tokenomics.totalSupply, 'Max Supply': result.tokenomics.maxSupply,
                    };
                    return <DataGrid title="Tokenomics" data={formattedTokenomics} />;
                case 'onchain':
                    const formattedOnChain = {
                        'Active Addresses (24h)': result.onChainMetrics.activeAddresses, 'Transaction Count (24h)': result.onChainMetrics.transactionCount24h,
                        'Total Value Locked (TVL)': `${result.onChainMetrics.totalValueLocked} ${currency}`, 'Hash Rate': result.onChainMetrics.hashRate,
                    };
                    return <DataGrid title="On-chain Metrics" data={formattedOnChain} />;
            }
        }
        return null;
    };


    return (
        <div className="bg-brand-surface border border-brand-border rounded-lg mt-6">
            <div className="border-b border-brand-border">
                <nav className="-mb-px flex space-x-1 sm:space-x-4 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" aria-label="Tabs">
                    {Object.entries(TABS).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`${
                                activeTab === key
                                    ? 'border-brand-primary text-brand-primary'
                                    : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors duration-150 focus:outline-none`}
                        >
                            {value}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="p-6">
                {renderContent()}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const countryCode = 'IN';
    const [selectedAsset, setSelectedAsset] = useState<string>('stocks');
    const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');

    const [selectedAssetItem, setSelectedAssetItem] = useState<WatchlistItem | null>(null);
    const [analysisResult, setAnalysisResult] = useState<StockAnalysisResult | CryptoAnalysisResult | null>(null);
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[] | null>(null);
    const [realTimeInfo, setRealTimeInfo] = useState<AssetRealTimeInfo | null>(null);
    const [chatSession, setChatSession] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const handleAssetAnalysis = useCallback(async (asset: WatchlistItem) => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setHistoricalData(null);
        setRealTimeInfo(null);
        setChatSession(null);

        try {
            const analysisPromise = selectedAsset === 'stocks'
                ? generateStockAnalysis(COUNTRIES.find(c => c.code === asset.countryCode)?.name || '', asset.ticker, asset.currencyCode)
                : generateCryptoAnalysis(asset.ticker, asset.currencyCode);

            const historyPromise = getHistoricalAssetData(asset.ticker);
            const realTimePromise = getRealTimeAssetData([asset.ticker]);
            const chatPromise = createChat(asset.name, selectedAsset);

            const [analysis, history, realTimeData, chat] = await Promise.all([
                analysisPromise,
                historyPromise,
                realTimePromise,
                chatPromise
            ]);
            
            setAnalysisResult(analysis);
            setHistoricalData(history);
            if (realTimeData && realTimeData.length > 0) {
                setRealTimeInfo(realTimeData[0]);
            }
            setChatSession(chat);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedAsset]);

    useEffect(() => {
        if (selectedAssetItem) {
            handleAssetAnalysis(selectedAssetItem);
        }
    }, [selectedAssetItem, handleAssetAnalysis]);

    const handleAssetSelect = (asset: WatchlistItem) => {
        setSelectedAssetItem(asset);
        setIsSidebarOpen(false);
    };

    const handleScreenerAssetSelect = (ticker: string, name: string) => {
        if (selectedAsset === 'stocks') {
            const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || 'INR';
            handleAssetSelect({ ticker, name, countryCode, currencyCode });
        } else {
            handleAssetSelect({ ticker, name, currencyCode: 'USD' });
        }
    };
    
    const handleAssetChange = (assetId: string) => {
        setSelectedAsset(assetId);
        setSelectedAssetItem(null);
        setAnalysisResult(null);
        setHistoricalData(null);
        setRealTimeInfo(null);
        setChatSession(null);
        setError(null);
        if (assetId === 'cryptocurrency') {
            setSelectedCurrency('USD');
        } else {
            setSelectedCurrency('INR');
        }
    };

    const handleSearch = (ticker: string) => {
        const watchlist = selectedAsset === 'stocks' ? WATCHLIST_STOCKS : CRYPTO_WATCHLIST;
        const asset = watchlist.find(s => s.ticker.toUpperCase() === ticker.toUpperCase());
        if(asset) {
            handleAssetSelect(asset);
        } else {
             if (selectedAsset === 'stocks') {
                handleAssetSelect({
                    ticker: ticker, name: ticker, countryCode: countryCode,
                    currencyCode: COUNTRY_CURRENCY_MAP[countryCode] || 'INR',
                });
             } else {
                handleAssetSelect({ ticker: ticker, name: ticker, currencyCode: 'USD' });
             }
        }
    }
    
    const handleHomeClick = () => {
        setSelectedAssetItem(null);
        setAnalysisResult(null);
        setHistoricalData(null);
        setRealTimeInfo(null);
        setChatSession(null);
        setError(null);
    }
    
    const renderContent = () => {
        if (!selectedAssetItem) {
            return <MarketScreener onAssetSelect={handleScreenerAssetSelect} assetType={selectedAsset} />;
        }
        
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <main className="col-span-12 lg:col-span-9">
                     {error && <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg mb-6" role="alert">{error}</div>}
                    
                    <div className="h-[300px] sm:h-[450px]">
                        <MemoizedGoogleChart data={historicalData} chartType="candlestick" isLoading={isLoading} />
                    </div>
                    
                    {analysisResult && <AISummary summary={analysisResult.aiSummary} isLoading={isLoading} />}
                    {isLoading && !analysisResult && <AISummary summary={null} isLoading={true} />}

                    {isLoading && !analysisResult && <div className="mt-6 p-6 bg-brand-surface border border-brand-border rounded-lg animate-pulse h-96"></div>}

                    {analysisResult && <AnalysisTabs result={analysisResult} currency={selectedAssetItem.currencyCode} />}
                </main>
                <aside className="col-span-12 lg:col-span-3">
                     <OrderPanel 
                        asset={selectedAssetItem}
                        analysisResult={analysisResult}
                        historicalData={historicalData}
                        realTimeInfo={realTimeInfo}
                        isLoading={isLoading}
                        assetType={selectedAsset}
                        chatSession={chatSession}
                    />
                </aside>
            </div>
        )
    };
    
    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-brand-bg text-brand-text-primary">
            <Header
                onSearch={handleSearch}
                isLoading={isLoading}
                onMenuClick={() => setIsSidebarOpen(true)}
                onHomeClick={handleHomeClick}
                selectedAsset={selectedAsset}
            />
            <div className="flex flex-1 overflow-hidden">
                {isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}
                <div className={`
                    fixed top-0 left-0 bottom-0 z-40
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:static lg:translate-x-0 lg:z-auto
                `}>
                    <Sidebar
                        selectedAsset={selectedAsset}
                        onAssetChange={handleAssetChange}
                        selectedCurrency={selectedCurrency}
                        onCurrencyChange={setSelectedCurrency}
                        onClose={() => setIsSidebarOpen(false)}
                        onAssetSelect={handleAssetSelect}
                        selectedAssetItem={selectedAssetItem}
                    />
                </div>
                <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default App;