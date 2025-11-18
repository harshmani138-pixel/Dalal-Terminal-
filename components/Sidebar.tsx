import React, { useState, useEffect } from 'react';
import { ASSETS, CURRENCIES, COUNTRIES, WATCHLIST_STOCKS, CRYPTO_WATCHLIST } from '../constants';
import { XIcon, GlobeAltIcon } from './icons';
import { WatchlistItem, AssetRealTimeInfo } from '../types';
import { getRealTimeAssetData } from '../services/geminiService';

interface SidebarProps {
    selectedAsset: string;
    onAssetChange: (id: string) => void;
    selectedCurrency: string;
    onCurrencyChange: (code: string) => void;
    onClose: () => void;
    onAssetSelect: (asset: WatchlistItem) => void;
    selectedAssetItem: WatchlistItem | null;
}

const SettingSelect: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
    <div className="px-4 py-3">
        <label className="block text-sm font-medium text-brand-text-secondary mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({
    selectedAsset, onAssetChange,
    selectedCurrency, onCurrencyChange,
    onClose, onAssetSelect, selectedAssetItem
}) => {
    const country = COUNTRIES[0];
    const [watchlistPrices, setWatchlistPrices] = useState<Record<string, AssetRealTimeInfo>>({});
    const [isLoadingPrices, setIsLoadingPrices] = useState(true);

    const watchlist = selectedAsset === 'stocks' ? WATCHLIST_STOCKS : CRYPTO_WATCHLIST;

    useEffect(() => {
        const fetchPrices = async () => {
            if (watchlist.length === 0) {
                setIsLoadingPrices(false);
                return;
            };
            setIsLoadingPrices(true);
            try {
                const tickers = watchlist.map(s => s.ticker);
                const prices = await getRealTimeAssetData(tickers);
                const priceMap: Record<string, AssetRealTimeInfo> = {};
                if (Array.isArray(prices)) {
                    prices.forEach(p => {
                        if (p && p.ticker) {
                           priceMap[p.ticker] = p;
                        }
                    });
                }
                setWatchlistPrices(priceMap);
            } catch (error) {
                console.error("Failed to fetch watchlist prices", error);
            } finally {
                setIsLoadingPrices(false);
            }
        };
        fetchPrices();
    }, [watchlist]);

    return (
        <aside className="w-64 bg-brand-surface border-r border-brand-border flex flex-col h-full">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-text-primary">Settings</h2>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1 text-brand-text-secondary hover:text-brand-text-primary focus:outline-none"
                    aria-label="Close settings"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div>
                    <div className="px-4 py-3">
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Country</label>
                        <div className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 text-sm flex items-center text-brand-text-primary">
                            <GlobeAltIcon className="w-5 h-5 mr-2 text-brand-text-secondary" />
                            <span>{country.name}</span>
                        </div>
                    </div>
                    <SettingSelect
                        label="Asset Class"
                        value={selectedAsset}
                        onChange={(e) => onAssetChange(e.target.value)}
                        options={ASSETS.map(a => ({ value: a.id, label: a.name }))}
                    />
                    <SettingSelect
                        label="Currency"
                        value={selectedCurrency}
                        onChange={(e) => onCurrencyChange(e.target.value)}
                        options={CURRENCIES.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))}
                    />
                </div>

                <div className="p-4 border-t border-brand-border">
                     <h3 className="text-md font-semibold text-brand-text-primary mb-3">Watchlist</h3>
                     <ul className="space-y-1">
                        {watchlist.map(asset => {
                            const priceInfo = watchlistPrices[asset.ticker];
                            const isSelected = selectedAssetItem?.ticker === asset.ticker;

                            const priceColor = priceInfo ? (priceInfo.change >= 0 ? 'text-brand-green' : 'text-brand-red') : 'text-brand-text-secondary';
                            const changeSymbol = priceInfo ? (priceInfo.change > 0 ? '+' : '') : '';
                            
                            return (
                                <li key={asset.ticker}>
                                    <button 
                                        onClick={() => onAssetSelect(asset)}
                                        className={`w-full text-left p-2 rounded-md transition-colors duration-150 ${isSelected ? 'bg-brand-primary/10' : 'hover:bg-brand-border/30'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className={`font-semibold text-sm ${isSelected ? 'text-brand-primary' : 'text-brand-text-primary'}`}>{asset.ticker}</p>
                                                <p className="text-xs text-brand-text-secondary truncate max-w-[120px]">{asset.name}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {isLoadingPrices ? (
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <div className="w-12 h-4 bg-brand-border/50 rounded animate-pulse"></div>
                                                        <div className="w-16 h-3 bg-brand-border/50 rounded animate-pulse"></div>
                                                    </div>
                                                ) : priceInfo ? (
                                                    <>
                                                        <p className={`font-semibold text-sm ${priceColor}`}>{priceInfo.price.toFixed(2)}</p>
                                                        <p className={`text-xs ${priceColor}`}>{`${changeSymbol}${priceInfo.change.toFixed(2)} (${changeSymbol}${priceInfo.changePercent.toFixed(2)}%)`}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-brand-text-secondary">N/A</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                     </ul>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;