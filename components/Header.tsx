import React, { useState, useEffect, useRef } from 'react';
import { GlobeAltIcon, SearchIcon, MenuIcon } from './icons';
import { WatchlistItem, AssetRealTimeInfo } from '../types';
import { getRealTimeAssetData } from '../services/geminiService';
import { WATCHLIST_STOCKS, CRYPTO_WATCHLIST } from '../constants';

interface HeaderProps {
    onSearch: (ticker: string) => void;
    isLoading: boolean;
    onMenuClick: () => void;
    onHomeClick: () => void;
    selectedAsset: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, isLoading, onMenuClick, onHomeClick, selectedAsset }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<WatchlistItem[]>([]);
    const [priceInfo, setPriceInfo] = useState<Record<string, AssetRealTimeInfo>>({});
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const watchlist = selectedAsset === 'stocks' ? WATCHLIST_STOCKS : CRYPTO_WATCHLIST;

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            setIsSuggestionsVisible(false);
            return;
        }

        const handler = setTimeout(() => {
            const filtered = watchlist.filter(stock =>
                stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                stock.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const newSuggestions = filtered.slice(0, 5);
            setSuggestions(newSuggestions);

            if (newSuggestions.length > 0) {
                const fetchPrices = async () => {
                    const tickers = newSuggestions.map(s => s.ticker);
                    try {
                        const newPriceInfo = await getRealTimeAssetData(tickers);
                        setPriceInfo(prev => {
                            const updated = { ...prev };
                            if (Array.isArray(newPriceInfo)) {
                                newPriceInfo.forEach(info => {
                                    if (info && info.ticker) {
                                        updated[info.ticker] = info;
                                    }
                                });
                            }
                            return updated;
                        });
                    } catch (error) {
                        console.error("Failed to fetch real-time asset prices", error);
                    }
                };
                fetchPrices();
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, watchlist]);

    const handleSuggestionClick = (ticker: string) => {
        setSearchTerm('');
        setSuggestions([]);
        setIsSuggestionsVisible(false);
        onSearch(ticker);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            handleSuggestionClick(searchTerm.trim().toUpperCase());
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSuggestionsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if(e.target.value.trim()){
            setIsSuggestionsVisible(true);
        } else {
            setIsSuggestionsVisible(false);
        }
    };

    return (
        <header className="flex-shrink-0 bg-brand-surface border-b border-brand-border px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1 -ml-1 text-brand-text-secondary hover:text-brand-text-primary focus:outline-none"
                    aria-label="Open settings"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <button onClick={onHomeClick} className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-md p-1 -ml-2 sm:-ml-1">
                    <GlobeAltIcon className="w-7 h-7 text-brand-primary" />
                    <h1 className="text-xl font-bold text-brand-text-primary font-logo">दलाल Terminal</h1>
                </button>
            </div>
            <div className="w-full max-w-xs" ref={searchContainerRef}>
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => { if (searchTerm) setIsSuggestionsVisible(true); }}
                        placeholder={`Search for a ${selectedAsset === 'stocks' ? 'stock' : 'crypto'}...`}
                        className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-brand-text-secondary" />
                    </div>
                </form>
                {isSuggestionsVisible && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full max-w-xs mt-1 bg-brand-surface border border-brand-border rounded-md shadow-lg overflow-hidden">
                        {suggestions.map((asset) => {
                            const info = priceInfo[asset.ticker];
                            const priceColor = info ? (info.change >= 0 ? 'text-brand-green' : 'text-brand-red') : 'text-brand-text-secondary';
                            const changeSymbol = info ? (info.change > 0 ? '+' : '') : '';
                            return (
                                <li key={asset.ticker}>
                                    <button
                                        onClick={() => handleSuggestionClick(asset.ticker)}
                                        className="w-full text-left px-4 py-3 hover:bg-brand-border/30 transition-colors duration-150 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-brand-text-primary">{asset.ticker}</p>

                                            <p className="text-xs text-brand-text-secondary truncate max-w-[150px]">{asset.name}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            {info ? (
                                                <>
                                                    <p className={`font-semibold text-sm ${priceColor}`}>{info.price.toFixed(2)}</p>
                                                    <p className={`text-xs ${priceColor}`}>{`${changeSymbol}${info.change.toFixed(2)} (${changeSymbol}${info.changePercent.toFixed(2)}%)`}</p>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-end space-y-1">
                                                   <div className="w-16 h-4 bg-brand-border/50 rounded animate-pulse"></div>
                                                   <div className="w-20 h-3 bg-brand-border/50 rounded animate-pulse"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </header>
    );
};

export default Header;