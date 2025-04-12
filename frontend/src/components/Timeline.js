import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Scatter,
  ReferenceLine
} from 'recharts';

const TimelineContainer = styled.div`
  width: 100%;
  height: 300px;
  margin: 20px 0;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: var(--text-color);
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--card-background)'};
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#444'};
  }
`;

// Mock data - this would come from your API
const generateMockData = (days = 30) => {
  const data = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const price = 100 + Math.random() * 50 - 25;
    const volume = Math.random() * 1000000;
    const sentiment = Math.random() * 2 - 1; // -1 to 1
    
    // Generate some news events randomly
    const hasNews = Math.random() > 0.7;
    const newsCount = hasNews ? Math.floor(Math.random() * 5) + 1 : 0;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price,
      volume,
      sentiment,
      newsCount,
      news: hasNews ? {
        id: `news-${i}`,
        title: `News Event ${i}`,
        sentiment: sentiment
      } : null
    });
  }
  
  return data;
};

const Timeline = () => {
  const [timeRange, setTimeRange] = useState('1M');
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    const days = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 365;
    setData(generateMockData(days));
  }, [timeRange]);
  
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };
  
  // Custom tooltip to show news and sentiment
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
          <p className="price">Price: ${dataPoint.price.toFixed(2)}</p>
          <p className="volume">Volume: {dataPoint.volume.toLocaleString()}</p>
          <p className="sentiment" style={{ 
            color: dataPoint.sentiment > 0 ? 'var(--positive-color)' : 
                  dataPoint.sentiment < 0 ? 'var(--negative-color)' : 'var(--neutral-color)'
          }}>
            Sentiment: {dataPoint.sentiment.toFixed(2)}
          </p>
          {dataPoint.newsCount > 0 && (
            <p className="news">News Events: {dataPoint.newsCount}</p>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <TimelineContainer>
      <TimelineHeader>
        <Title>Market Timeline</Title>
        <Controls>
          <Button active={timeRange === '1W'} onClick={() => handleTimeRangeChange('1W')}>1W</Button>
          <Button active={timeRange === '1M'} onClick={() => handleTimeRangeChange('1M')}>1M</Button>
          <Button active={timeRange === '3M'} onClick={() => handleTimeRangeChange('3M')}>3M</Button>
          <Button active={timeRange === '1Y'} onClick={() => handleTimeRangeChange('1Y')}>1Y</Button>
        </Controls>
      </TimelineHeader>
      
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
            domain={[-1, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
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
            dataKey="price" 
            stroke="#ff9800" 
            dot={false} 
            name="Price"
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#4caf50" 
            dot={false} 
            name="Sentiment"
          />
          <Scatter 
            yAxisId="left" 
            dataKey="price" 
            data={data.filter(d => d.newsCount > 0)} 
            fill="#f44336" 
            name="News Events"
          />
          <ReferenceLine 
            yAxisId="right" 
            y={0} 
            stroke="#666" 
            strokeDasharray="3 3" 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </TimelineContainer>
  );
};

export default Timeline;
