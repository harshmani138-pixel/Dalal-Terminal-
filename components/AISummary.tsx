import React from 'react';
import { StockAISummary } from '../types';
import TrendChart from './TrendChart';
import {
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon,
    BoltIcon,
    SignalIcon,
    ShieldCheckIcon
} from './icons';

interface SummaryCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, colorClass }) => (
    <div className="bg-brand-surface p-4 rounded-lg flex items-center">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center mr-4 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-brand-text-secondary">{label}</p>
            <p className="text-lg font-semibold text-brand-text-primary">{value}</p>
        </div>
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-brand-surface p-4 rounded-lg flex items-center animate-pulse">
        <div className="w-10 h-10 rounded-md bg-brand-border/50 mr-4"></div>
        <div>
            <div className="h-4 bg-brand-border/50 rounded w-16 mb-2"></div>
            <div className="h-6 bg-brand-border/50 rounded w-24"></div>
        </div>
    </div>
);

interface AISummaryProps {
    summary: StockAISummary | null;
    isLoading: boolean;
}

const AISummary: React.FC<AISummaryProps> = ({ summary, isLoading }) => {
    if (isLoading) {
        return (
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">AI Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    const trendMap = {
        Bullish: { icon: <ArrowTrendingUpIcon className="w-6 h-6" />, color: 'bg-brand-green-surface text-brand-green' },
        Bearish: { icon: <ArrowTrendingDownIcon className="w-6 h-6" />, color: 'bg-brand-red-surface text-brand-red' },
        Sideways: { icon: <MinusIcon className="w-6 h-6" />, color: 'bg-brand-border text-brand-text-secondary' },
    };

    const momentumMap = {
        Strong: { icon: <BoltIcon className="w-6 h-6" />, color: 'bg-brand-green-surface text-brand-green' },
        Weak: { icon: <BoltIcon className="w-6 h-6" />, color: 'bg-brand-red-surface text-brand-red' },
        Neutral: { icon: <BoltIcon className="w-6 h-6" />, color: 'bg-brand-border text-brand-text-secondary' },
    };

    const volatilityMap = {
        High: { icon: <SignalIcon className="w-6 h-6" />, color: 'bg-brand-red-surface text-brand-red' },
        Medium: { icon: <SignalIcon className="w-6 h-6" />, color: 'bg-yellow-500/20 text-yellow-400' },
        Low: { icon: <SignalIcon className="w-6 h-6" />, color: 'bg-brand-green-surface text-brand-green' },
    };

    const riskMap = {
        High: { icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'bg-brand-red-surface text-brand-red' },
        Medium: { icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'bg-yellow-500/20 text-yellow-400' },
        Low: { icon: <ShieldCheckIcon className="w-6 h-6" />, color: 'bg-brand-green-surface text-brand-green' },
    };

    const trendInfo = trendMap[summary.trend] || trendMap.Sideways;
    const momentumInfo = momentumMap[summary.momentum] || momentumMap.Neutral;
    const volatilityInfo = volatilityMap[summary.volatility] || volatilityMap.Medium;
    const riskInfo = riskMap[summary.riskLevel] || riskMap.Medium;

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4 text-brand-text-primary">AI Summary</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div>
                     <TrendChart summary={summary} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SummaryCard label="Trend" value={summary.trend} icon={trendInfo.icon} colorClass={trendInfo.color} />
                    <SummaryCard label="Momentum" value={summary.momentum} icon={momentumInfo.icon} colorClass={momentumInfo.color} />
                    <SummaryCard label="Volatility" value={summary.volatility} icon={volatilityInfo.icon} colorClass={volatilityInfo.color} />
                    <SummaryCard label="Risk Level" value={summary.riskLevel} icon={riskInfo.icon} colorClass={riskInfo.color} />
                </div>
            </div>
        </div>
    );
};

export default AISummary;
