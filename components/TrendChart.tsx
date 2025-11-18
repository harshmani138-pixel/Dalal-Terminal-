import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { StockAISummary } from '../types';

interface TrendChartProps {
    summary: StockAISummary;
}

const TrendChart: React.FC<TrendChartProps> = ({ summary }) => {
    const valueMapping: Record<string, number> = {
        // Trend
        'Bullish': 3,
        'Sideways': 2,
        'Bearish': 1,
        // Momentum
        'Strong': 3,
        'Neutral': 2,
        'Weak': 1,
        // Volatility & Risk
        'High': 3,
        'Medium': 2,
        'Low': 1,
    };

    const data = [
        { subject: 'Trend', value: valueMapping[summary.trend] || 0, fullMark: 3 },
        { subject: 'Momentum', value: valueMapping[summary.momentum] || 0, fullMark: 3 },
        { subject: 'Volatility', value: valueMapping[summary.volatility] || 0, fullMark: 3 },
        { subject: 'Risk Level', value: valueMapping[summary.riskLevel] || 0, fullMark: 3 },
    ];
    
    const tickFormatter = (value: number) => {
        if (value === 1) return 'Low';
        if (value === 2) return 'Med';
        if (value === 3) return 'High';
        return '';
    };

    return (
        <div className="bg-brand-surface p-4 rounded-lg h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <defs>
                        <radialGradient id="radar-gradient">
                            <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#58A6FF" stopOpacity={0.1}/>
                        </radialGradient>
                    </defs>
                    <PolarGrid stroke="#30363D" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B949E', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 3]} tickFormatter={tickFormatter} tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} />
                    <Radar name="AI Summary" dataKey="value" stroke="#58A6FF" fill="url(#radar-gradient)" fillOpacity={0.6} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0A0E13',
                            borderColor: '#30363D',
                            color: '#E6EDF3'
                        }}
                        formatter={(value: number, name: string, props) => {
                             const subject = props.payload.subject;
                             if(subject === "Trend") return summary.trend;
                             if(subject === "Momentum") return summary.momentum;
                             if(subject === "Volatility") return summary.volatility;
                             if(subject === "Risk Level") return summary.riskLevel;
                             return value;
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendChart;
