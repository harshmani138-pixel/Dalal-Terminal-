
import React from 'react';

interface AnalysisCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isLoading: boolean;
    className?: string;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
);

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, children, isLoading, className = '' }) => {
    return (
        <div className={`bg-brand-surface border border-brand-border rounded-lg p-6 flex flex-col ${className}`}>
            <div className="flex items-center mb-4 text-brand-text-secondary">
                {icon}
                <h3 className="text-lg font-semibold ml-3 text-brand-text-primary">{title}</h3>
            </div>
            <div className="flex-grow text-brand-text-primary leading-relaxed prose prose-invert prose-p:text-brand-text-primary prose-headings:text-brand-text-primary">
                {isLoading ? <SkeletonLoader /> : children}
            </div>
        </div>
    );
};

export default AnalysisCard;
