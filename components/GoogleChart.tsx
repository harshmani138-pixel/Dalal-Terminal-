import React, { useEffect, useRef, memo } from 'react';
import { HistoricalDataPoint } from '../types';

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleChartProps {
    data: HistoricalDataPoint[] | null;
    chartType: 'candlestick' | 'area';
    isLoading: boolean;
}

const ChartLoader: React.FC = () => (
    <div className="h-full w-full flex items-center justify-center bg-brand-surface animate-pulse">
        <p className="text-brand-text-secondary">Loading Chart...</p>
    </div>
);

const ChartError: React.FC = () => (
    <div className="h-full w-full flex items-center justify-center bg-brand-surface">
        <p className="text-brand-red">Could not load chart data.</p>
    </div>
);

const GoogleChart: React.FC<GoogleChartProps> = ({ data, chartType, isLoading }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isLoading || !data || data.length === 0) {
            return;
        }

        const drawChart = () => {
            if (!chartRef.current) return;

            let dataTable;
            let options;
            let chart;

            const commonOptions = {
                backgroundColor: 'transparent',
                chartArea: {
                    backgroundColor: 'transparent',
                    left: chartType === 'area' ? 0 : 50,
                    top: chartType === 'area' ? 0 : 20,
                    width: '90%',
                    height: '80%'
                },
                hAxis: {
                    textStyle: { color: '#8B949E' },
                    gridlines: { color: 'transparent' }
                },
                vAxis: {
                    textStyle: { color: '#8B949E' },
                    gridlines: { color: '#30363D' }
                },
                legend: { position: 'none' },
            };

            if (chartType === 'candlestick') {
                const chartData: (string | number | Date)[][] = [['Day', 'Low', 'Open', 'Close', 'High']];
                data.forEach(d => {
                    chartData.push([new Date(d.date), d.low, d.open, d.close, d.high]);
                });

                dataTable = window.google.visualization.arrayToDataTable(chartData, true);

                options = {
                    ...commonOptions,
                    candlestick: {
                        fallingColor: { strokeWidth: 0, fill: '#DA3633' }, // red
                        risingColor: { strokeWidth: 0, fill: '#238636' }   // green
                    },
                    bar: { groupWidth: '85%' },
                };

                chart = new window.google.visualization.CandlestickChart(chartRef.current);
            } else { // area
                const chartData: (string | number | Date)[][] = [['Date', 'Close']];
                data.forEach(d => {
                    chartData.push([new Date(d.date), d.close]);
                });

                dataTable = window.google.visualization.arrayToDataTable(chartData);

                const lastValue = data[data.length-1].close;
                const firstValue = data[0].close;
                const color = lastValue >= firstValue ? '#238636' : '#DA3633';

                options = {
                    ...commonOptions,
                    colors: [color],
                    areaOpacity: 0.1,
                    hAxis: { ...commonOptions.hAxis, gridlines: { color: 'transparent' }, textPosition: 'none' },
                    vAxis: { ...commonOptions.vAxis, gridlines: { color: 'transparent' }, textPosition: 'none' },
                };
                chart = new window.google.visualization.AreaChart(chartRef.current);
            }
            
            chart.draw(dataTable, options);
        };

        if (window.google && window.google.charts) {
            window.google.charts.load('current', { packages: ['corechart'] });
            window.google.charts.setOnLoadCallback(drawChart);
        }

        const handleResize = () => drawChart();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);

    }, [data, chartType, isLoading]);

    if (isLoading) {
        return <ChartLoader />;
    }
    if (!data || data.length === 0) {
        return <ChartError />;
    }

    return <div ref={chartRef} className="h-full w-full" />;
};

export const MemoizedGoogleChart = memo(GoogleChart);