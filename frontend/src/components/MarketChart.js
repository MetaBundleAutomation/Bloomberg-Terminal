import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin: 20px 0;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: var(--text-color);
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const Change = styled.div`
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => props.positive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  color: ${props => props.positive ? 'var(--positive-color)' : 'var(--negative-color)'};
`;

// Mock data - this would come from your API
const generateCandlestickData = (days = 30) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  let price = 150;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Generate random price movement
    const change = (Math.random() - 0.5) * 5;
    price += change;
    
    const open = price;
    const close = price + (Math.random() - 0.5) * 3;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.random() * 1000000 + 500000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return data;
};

const MarketChart = ({ symbol = 'AAPL' }) => {
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const candlestickData = generateCandlestickData(30);
    setData(candlestickData);
    
    // Set current price and change
    const lastDay = candlestickData[candlestickData.length - 1];
    const prevDay = candlestickData[candlestickData.length - 2];
    
    setCurrentPrice(lastDay.close);
    const change = lastDay.close - prevDay.close;
    setPriceChange(change);
    setPercentChange((change / prevDay.close) * 100);
  }, [symbol]);
  
  // Custom tooltip for candlestick data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: '#333', 
          padding: '10px', 
          border: '1px solid #444',
          borderRadius: '4px'
        }}>
          <p className="date">{label}</p>
          <p className="ohlc">
            O: ${dataPoint.open.toFixed(2)} | 
            H: ${dataPoint.high.toFixed(2)} | 
            L: ${dataPoint.low.toFixed(2)} | 
            C: ${dataPoint.close.toFixed(2)}
          </p>
          <p className="volume">Volume: {dataPoint.volume.toLocaleString()}</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Calculate if current price is up or down
  const isPositive = priceChange >= 0;
  
  return (
    <ChartContainer>
      <ChartHeader>
        <Title>{symbol} Stock Chart</Title>
        <StockInfo>
          <Price>${currentPrice.toFixed(2)}</Price>
          <Change positive={isPositive}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
          </Change>
        </StockInfo>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis 
            dataKey="date" 
            scale="auto" 
            tick={{ fill: 'var(--text-color)' }}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            tick={{ fill: 'var(--text-color)' }}
            domain={['auto', 'auto']}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tick={{ fill: 'var(--text-color)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Candlestick representation using lines and bars */}
          <Bar 
            yAxisId="left" 
            dataKey="volume" 
            fill="rgba(33, 150, 243, 0.3)" 
            barSize={20} 
            name="Volume"
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="close" 
            stroke="#ff9800" 
            dot={false} 
            name="Close Price"
          />
          <ReferenceLine 
            yAxisId="left" 
            y={currentPrice} 
            stroke="#666" 
            strokeDasharray="3 3" 
            label={{ value: 'Current', position: 'insideBottomRight', fill: 'var(--text-color)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MarketChart;
