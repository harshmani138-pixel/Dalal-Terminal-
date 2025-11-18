import { Asset, Country, Currency, WatchlistItem } from './types';

export const COUNTRIES: Country[] = [
    { code: 'IN', name: 'India' },
];

export const ASSETS: Asset[] = [
    { id: 'stocks', name: 'Stocks' },
    { id: 'cryptocurrency', name: 'Cryptocurrency' },
    { id: 'bonds', name: 'Bonds' },
    { id: 'commodities', name: 'Commodities' },
    { id: 'real_estate', name: 'Real Estate' },
    { id: 'forex', name: 'Forex (FX)' },
];

export const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'BRL', name: 'Brazilian Real' },
];

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    IN: 'INR',
};


export const STOCK_EXAMPLES_BY_COUNTRY: Record<string, string[]> = {
    IN: ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS'],
};

export const TRADINGVIEW_EXCHANGES: Record<string, string> = {
    IN: 'NSE',
};

export const WATCHLIST_STOCKS: WatchlistItem[] = [
    { ticker: 'RELIANCE.NS', name: 'Reliance Industries', countryCode: 'IN', currencyCode: 'INR' },
    { ticker: 'TCS.NS', name: 'Tata Consultancy', countryCode: 'IN', currencyCode: 'INR' },
    { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', countryCode: 'IN', currencyCode: 'INR' },
    { ticker: 'INFY.NS', name: 'Infosys Ltd.', countryCode: 'IN', currencyCode: 'INR' },
    { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', countryCode: 'IN', currencyCode: 'INR' },
    { ticker: 'HINDUNILVR.NS', name: 'Hindustan Unilever', countryCode: 'IN', currencyCode: 'INR' },
];

export const CRYPTO_WATCHLIST: WatchlistItem[] = [
    { ticker: 'BTC', name: 'Bitcoin', currencyCode: 'USD' },
    { ticker: 'ETH', name: 'Ethereum', currencyCode: 'USD' },
    { ticker: 'SOL', name: 'Solana', currencyCode: 'USD' },
    { ticker: 'XRP', name: 'XRP', currencyCode: 'USD' },
    { ticker: 'DOGE', name: 'Dogecoin', currencyCode: 'USD' },
    { ticker: 'ADA', name: 'Cardano', currencyCode: 'USD' },
];