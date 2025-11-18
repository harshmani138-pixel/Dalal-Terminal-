import React, { useState, useEffect, useCallback } from 'react';
import { generateMarketScreener, generateCryptoScreener } from '../services/geminiService';
import { ScreenerResult, ScreenerStock, StockScreenerResult, CryptoScreenerResult } from '../types';
import { COUNTRIES } from '../constants';

interface MarketScreenerProps {
    onAssetSelect: (ticker: string, name: string) => void;
    assetType: string;
}

const isStockScreenerResult = (result: ScreenerResult): result is StockScreenerResult => {
    return (result as StockScreenerResult).highVolume !== undefined;
}

const ScreenerList: React.FC<{ title: string; stocks: ScreenerStock[]; onStockSelect: (stock: ScreenerStock) => void; }> = ({ title, stocks, onStockSelect }) => (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4 h-full flex flex-col">
        <h3 className="text-md font-semibold mb-3 text-brand-primary">{title}</h3>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            {stocks && stocks.length > 0 ? (
                <ul className="space-y-3">
                    {stocks.map((stock) => (
                        <li key={stock.ticker}>
                            <button
                                onClick={() => onStockSelect(stock)}
                                className="w-full text-left p-2 rounded-md hover:bg-brand-border/30 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm text-brand-text-primary">{stock.ticker}</p>
                                        <p className="text-xs text-brand-text-secondary truncate max-w-[150px]">{stock.name}</p>
                                    </div>
                                    <span className={`text-sm font-semibold ${stock.change.startsWith('+') ? 'text-brand-green' : 'text-brand-red'}`}>
                                        {stock.change}
                                    </span>
                                </div>
                                <p className="text-xs text-brand-text-secondary mt-1 italic">"{stock.reason}"</p>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-brand-text-secondary italic">No data available.</p>
            )}
        </div>
    </div>
);


const ScreenerSkeleton: React.FC = () => (
    <div className="bg-brand-surface border border-brand-border rounded-lg p-4 animate-pulse">
        <div className="h-5 bg-brand-border/50 rounded w-3/4 mb-4"></div>
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="h-4 bg-brand-border/50 rounded w-16 mb-1"></div>
                            <div className="h-3 bg-brand-border/50 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-brand-border/50 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-brand-border/50 rounded w-full mt-2"></div>
                </div>
            ))}
        </div>
    </div>
);


const MarketScreener: React.FC<MarketScreenerProps> = ({ onAssetSelect, assetType }) => {
    const [screenerResult, setScreenerResult] = useState<ScreenerResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchScreenerData = useCallback(async (type: string) => {
        setIsLoading(true);
        setError(null);
        setScreenerResult(null);

        try {
            if (type === 'stocks') {
                const country = COUNTRIES[0];
                const result = await generateMarketScreener(country.name);
                setScreenerResult(result);
            } else if (type === 'cryptocurrency') {
                const result = await generateCryptoScreener();
                setScreenerResult(result);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load screener data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScreenerData(assetType);
    }, [assetType, fetchScreenerData]);

    const handleStockClick = (stock: ScreenerStock) => {
        onAssetSelect(stock.ticker, stock.name);
    };
    
    const countryName = COUNTRIES.find(c => c.code === 'IN')?.name || 'Market';
    const screenerTitle = assetType === 'stocks' ? `Market Screener: ${countryName}` : 'Cryptocurrency Screener';

    const renderScreenerLists = () => {
        if (!screenerResult) return null;
        if (isStockScreenerResult(screenerResult)) {
            return (
                 <>
                    <ScreenerList title="Top Gainers" stocks={screenerResult.topGainers} onStockSelect={handleStockClick} />
                    <ScreenerList title="Top Losers" stocks={screenerResult.topLosers} onStockSelect={handleStockClick} />
                    <ScreenerList title="High Volume" stocks={screenerResult.highVolume} onStockSelect={handleStockClick} />
                    <ScreenerList title="Overbought (RSI > 70)" stocks={screenerResult.overboughtRSI} onStockSelect={handleStockClick} />
                    <ScreenerList title="Oversold (RSI < 30)" stocks={screenerResult.oversoldRSI} onStockSelect={handleStockClick} />
                </>
            )
        } else { // It's CryptoScreenerResult
             return (
                 <>
                    <ScreenerList title="Top Gainers" stocks={screenerResult.topGainers} onStockSelect={handleStockClick} />
                    <ScreenerList title="Top Losers" stocks={screenerResult.topLosers} onStockSelect={handleStockClick} />
                    <ScreenerList title="Trending" stocks={screenerResult.trending} onStockSelect={handleStockClick} />
                    <ScreenerList title="Newly Listed" stocks={screenerResult.newlyListed} onStockSelect={handleStockClick} />
                    <div className="hidden xl:block"></div>
                </>
            )
        }
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-brand-text-primary mb-2 sm:mb-0">{screenerTitle}</h1>
            </div>

            {error && <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg mb-6" role="alert">{error}</div>}

            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {isLoading ? (
                    [...Array(5)].map((_, i) => <ScreenerSkeleton key={i} />)
                ) : (
                    renderScreenerLists()
                )}
            </div>
        </div>
    );
};

export default MarketScreener;