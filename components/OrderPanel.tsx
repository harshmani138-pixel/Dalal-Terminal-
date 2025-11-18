import React from 'react';
import { StockAnalysisResult, CryptoAnalysisResult, WatchlistItem, HistoricalDataPoint, AssetRealTimeInfo } from '../types';
import { MemoizedGoogleChart } from './GoogleChart';
import ChatPanel from './ChatPanel';

const isStockAnalysis = (result: any): result is StockAnalysisResult => {
    return result && 'fundamentals' in result;
};

interface OrderPanelProps {
    asset: WatchlistItem;
    analysisResult: StockAnalysisResult | CryptoAnalysisResult | null;
    historicalData: HistoricalDataPoint[] | null;
    realTimeInfo: AssetRealTimeInfo | null;
    isLoading: boolean;
    assetType: string;
    chatSession: any | null;
}

const Stat: React.FC<{ label: string; value: string | number; isLoading?: boolean }> = ({ label, value, isLoading }) => (
    <div className="flex justify-between text-sm py-2 border-b border-brand-border/50">
        <span className="text-brand-text-secondary">{label}</span>
        {isLoading ? (
            <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
        ) : (
            <span className="font-semibold text-brand-text-primary text-right">{value}</span>
        )}
    </div>
);


const OrderPanel: React.FC<OrderPanelProps> = ({ asset, analysisResult, isLoading, historicalData, assetType, realTimeInfo, chatSession }) => {
    const formatValue = (value?: number | string, prefix = '', suffix = '') => {
        if (isLoading) return '';
        if (value === undefined || value === null || value === '') return 'N/A';
        if (typeof value === 'string' && !/\d/.test(value)) return value;
        const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
        if(isNaN(num)) return value;
        return `${prefix}${num.toLocaleString()}${suffix}`;
    };

    const renderStockStats = () => {
        if (!isStockAnalysis(analysisResult)) return null;
        const fundamentals = analysisResult?.fundamentals;
        const technicals = analysisResult?.technicals;
        return (
            <>
                <Stat label="P/E Ratio" value={formatValue(fundamentals?.peRatio)} isLoading={isLoading} />
                <Stat label="EPS" value={formatValue(fundamentals?.eps, `${asset.currencyCode} `)} isLoading={isLoading} />
                <Stat label="Div. Yield" value={formatValue(fundamentals?.dividendYield, '', '%')} isLoading={isLoading} />
                <Stat label="52-Wk High" value={formatValue(technicals?.['52WeekHigh'], `${asset.currencyCode} `)} isLoading={isLoading} />
                <Stat label="52-Wk Low" value={formatValue(technicals?.['52WeekLow'], `${asset.currencyCode} `)} isLoading={isLoading} />
            </>
        )
    };
    
    const renderCryptoStats = () => {
        if (isStockAnalysis(analysisResult) || !analysisResult) return null;
        const tokenomics = analysisResult?.tokenomics;
        return (
            <>
                <Stat label="Market Cap" value={formatValue(tokenomics?.marketCap, `${asset.currencyCode} `)} isLoading={isLoading} />
                <Stat label="Volume (24h)" value={formatValue(tokenomics?.tradingVolume24h, `${asset.currencyCode} `)} isLoading={isLoading} />
                <Stat label="Circ. Supply" value={formatValue(tokenomics?.circulatingSupply)} isLoading={isLoading} />
                <Stat label="Total Supply" value={formatValue(tokenomics?.totalSupply)} isLoading={isLoading} />
                <Stat label="Max Supply" value={formatValue(tokenomics?.maxSupply)} isLoading={isLoading} />
            </>
        )
    }

    const priceColor = realTimeInfo ? (realTimeInfo.change >= 0 ? 'text-brand-green' : 'text-brand-red') : 'text-brand-text-primary';
    const changeSymbol = realTimeInfo ? (realTimeInfo.change > 0 ? '+' : '') : '';

    return (
        <div className="bg-brand-surface border border-brand-border rounded-lg flex flex-col h-full max-h-[calc(100vh-100px)]">
            <div className="p-4 border-b border-brand-border flex-shrink-0">
                 <div className="flex justify-between items-start">
                    <div>
                         <h2 className="text-lg font-bold text-brand-text-primary">{asset.ticker}</h2>
                         <p className="text-sm text-brand-text-secondary truncate max-w-[150px]">{asset.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        {isLoading && !realTimeInfo ? (
                            <>
                                <div className="h-6 bg-brand-border/50 rounded w-20 mb-1 animate-pulse"></div>
                                <div className="h-4 bg-brand-border/50 rounded w-24 animate-pulse"></div>
                            </>
                        ) : realTimeInfo ? (
                            <>
                                <p className={`text-xl font-bold ${priceColor}`}>
                                    {realTimeInfo.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className={`text-sm font-semibold ${priceColor}`}>
                                    {changeSymbol}{realTimeInfo.change.toFixed(2)} ({changeSymbol}{realTimeInfo.changePercent.toFixed(2)}%)
                                </p>
                            </>
                        ) : null}
                    </div>
                 </div>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
                <div className="h-[140px] mb-4">
                    <MemoizedGoogleChart data={historicalData} chartType="area" isLoading={isLoading} />
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button className="w-full bg-brand-green-surface hover:border-brand-green border-2 border-transparent text-brand-green font-bold py-2.5 px-4 rounded-md transition-all duration-200">
                            Buy
                        </button>
                        <button className="w-full bg-brand-red-surface hover:border-brand-red border-2 border-transparent text-brand-red font-bold py-2.5 px-4 rounded-md transition-all duration-200">
                            Sell
                        </button>
                    </div>

                    <div>
                        <h3 className="text-md font-semibold text-brand-text-primary mb-2">Key Statistics</h3>
                        <div className="space-y-1">
                           {assetType === 'stocks' ? renderStockStats() : renderCryptoStats()}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 border-t border-brand-border">
                <ChatPanel
                    chatSession={chatSession}
                    assetName={asset.name}
                    isLoading={isLoading && !analysisResult}
                />
            </div>
        </div>
    );
};

export default OrderPanel;