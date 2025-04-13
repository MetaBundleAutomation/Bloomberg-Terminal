import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import axios from 'axios';

const TimelineContainer = styled.div`
  width: 100%;
  height: 500px;
  margin: 0 0 20px 0;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  position: relative;
  user-select: none; /* Prevent text selection */
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: var(--text-primary);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--card-background)'};
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  margin-right: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#444'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-color);
  }
`;

const SelectionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SelectionModeButton = styled.button`
  background-color: ${props => props.active ? 'var(--accent-color)' : 'var(--button-background)'};
  color: ${props => props.active ? 'var(--button-text-active)' : 'var(--button-text)'};
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--accent-color)' : 'var(--button-hover-background)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-color);
  }
`;

const ClearButton = styled.button`
  background-color: var(--button-background);
  color: var(--button-text);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 8px;
  margin-right: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--button-hover-background);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--focus-color);
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
`;

const SelectionInfo = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-secondary);
`;

const Timeline = ({ dataSource, symbol, onDateSelect, onDateRangeSelect }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectionMode, setSelectionMode] = useState('point'); // 'point' or 'range'
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [rangeSelectionInProgress, setRangeSelectionInProgress] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [timeRange, setTimeRange] = useState('1M'); // Default to 1 month
  const chartRef = useRef(null);
  
  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Calculate days based on timeRange
        let days = 30; // Default to 1 month
        
        switch (timeRange) {
          case '1W':
            days = 7;
            break;
          case '1M':
            days = 30;
            break;
          case '3M':
            days = 90;
            break;
          case '1Y':
            days = 365;
            break;
          default:
            days = 30;
        }
        
        // Use the correct API endpoint format from the backend
        const endpoint = `http://localhost:8001/api/timeline?symbol=${symbol || 'GENERAL'}&days=${days}`;
        console.log('Fetching timeline data from:', endpoint);
        
        const response = await axios.get(endpoint);
        console.log('Timeline data received:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load timeline data. Please try again later.');
        
        // Fallback to empty array
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dataSource, symbol, timeRange]);
  
  // Handle time range change
  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
    
    // Reset selections when time range changes
    setSelectedDate(null);
    setRangeStart(null);
    setRangeEnd(null);
    setRangeSelectionInProgress(false);
    
    if (onDateSelect) {
      onDateSelect(null);
    }
    
    if (onDateRangeSelect) {
      onDateRangeSelect(null);
    }
  }, [onDateSelect, onDateRangeSelect]);
  
  // Handle point selection
  const handlePointSelection = useCallback((date) => {
    console.log('Point selection:', date);
    
    // Format the date as YYYY-MM-DD
    const formattedDate = typeof date === 'string' ? date : 
      (date instanceof Date ? date.toISOString().split('T')[0] : null);
    
    if (!formattedDate) {
      console.error('Invalid date format for point selection:', date);
      return;
    }
    
    setSelectedDate(formattedDate);
    setRangeStart(null);
    setRangeEnd(null);
    setRangeSelectionInProgress(false);
    
    // For point selection, we'll use the same date for both filtering and display
    if (onDateRangeSelect) {
      // Create a range that covers just the selected date
      const startDate = formattedDate;
      const endDate = formattedDate;
      
      console.log(`Point selection as range: ${startDate} to ${endDate}`);
      onDateRangeSelect({ 
        startDate, 
        endDate,
        displayEndDate: endDate
      });
    }
    
    // Still call onDateSelect for other UI updates
    if (onDateSelect) {
      onDateSelect(formattedDate);
    }
  }, [onDateSelect, onDateRangeSelect]);
  
  // Handle first click of range selection
  const handleRangeStart = useCallback((date) => {
    console.log('Range selection start:', date);
    
    // Format the date as YYYY-MM-DD
    const formattedDate = typeof date === 'string' ? date : 
      (date instanceof Date ? date.toISOString().split('T')[0] : null);
    
    if (!formattedDate) {
      console.error('Invalid date format for range start selection:', date);
      return;
    }
    
    setSelectedDate(null);
    setRangeStart(formattedDate);
    setRangeEnd(null);
    setRangeSelectionInProgress(true);
    
    if (onDateSelect) {
      onDateSelect(null);
    }
    
    if (onDateRangeSelect) {
      onDateRangeSelect(null);
    }
  }, [onDateSelect, onDateRangeSelect]);
  
  // Handle second click of range selection
  const handleRangeEnd = useCallback((date) => {
    console.log('Range selection end:', date);
    
    // Format the date as YYYY-MM-DD
    const formattedDate = typeof date === 'string' ? date : 
      (date instanceof Date ? date.toISOString().split('T')[0] : null);
    
    if (!formattedDate) {
      console.error('Invalid date format for range end selection:', date);
      return;
    }
    
    // Format the range start as YYYY-MM-DD (if it's not already)
    const formattedRangeStart = typeof rangeStart === 'string' ? rangeStart : 
      (rangeStart instanceof Date ? rangeStart.toISOString().split('T')[0] : null);
    
    if (!formattedRangeStart) {
      console.error('Invalid date format for range start:', rangeStart);
      return;
    }
    
    // Determine the correct start and end dates
    const start = new Date(formattedRangeStart);
    const end = new Date(formattedDate);
    
    let startDate, endDate;
    
    if (start <= end) {
      startDate = formattedRangeStart;
      endDate = formattedDate;
    } else {
      startDate = formattedDate;
      endDate = formattedRangeStart;
    }
    
    setRangeEnd(formattedDate);
    setRangeSelectionInProgress(false);
    
    if (onDateRangeSelect) {
      // For display purposes, we use the selected end date
      const displayEndDate = endDate;
      
      // For API filtering, we need to include the full end date
      // We no longer add a day to the end date, as we'll use string comparison in the NewsFeed component
      
      console.log(`Range selection: ${startDate} to ${displayEndDate}`);
      onDateRangeSelect({ 
        startDate, 
        endDate: displayEndDate,  // Now using the same date for both
        displayEndDate 
      });
    }
  }, [rangeStart, onDateRangeSelect]);
  
  // Handle mouse move during range selection
  const handleMouseMove = useCallback((e) => {
    if (!rangeSelectionInProgress || !chartRef.current) return;
    
    try {
      // Get chart dimensions
      const chartRect = chartRef.current.getBoundingClientRect();
      const chartX = e.clientX - chartRect.left;
      const chartWidth = chartRect.width;
      
      // Calculate position as percentage of chart width
      if (chartWidth > 0) {
        const positionPercent = Math.max(0, Math.min(1, chartX / chartWidth));
        const dateIndex = Math.floor(positionPercent * data.length);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, dateIndex));
        const hoverDate = data[clampedIndex].date;
        setHoveredDate(hoverDate);
      }
    } catch (err) {
      console.error("Error during range selection:", err);
    }
  }, [data, rangeSelectionInProgress]);
  
  // Set up event listeners for mouse move
  useEffect(() => {
    if (!rangeSelectionInProgress) return;
    
    // Prevent default browser text selection during drag
    const preventDefaultSelection = (e) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('selectstart', preventDefaultSelection);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('selectstart', preventDefaultSelection);
    };
  }, [rangeSelectionInProgress, handleMouseMove]);
  
  // Handle chart click
  const handleChartClick = useCallback((event) => {
    if (!event || !event.activeLabel) return;
    
    const clickedDate = event.activeLabel;
    console.log('Chart clicked:', clickedDate, 'Mode:', selectionMode, 'In progress:', rangeSelectionInProgress);
    
    if (selectionMode === 'point') {
      handlePointSelection(clickedDate);
    } else if (selectionMode === 'range') {
      if (rangeSelectionInProgress) {
        handleRangeEnd(clickedDate);
      } else {
        handleRangeStart(clickedDate);
      }
    }
  }, [selectionMode, rangeSelectionInProgress, handlePointSelection, handleRangeStart, handleRangeEnd]);
  
  // Handle selection mode change
  const handleSelectionModeChange = useCallback((mode) => {
    setSelectionMode(mode);
    setSelectedDate(null);
    setRangeStart(null);
    setRangeEnd(null);
    setRangeSelectionInProgress(false);
    
    if (onDateSelect) {
      onDateSelect(null);
    }
    
    if (onDateRangeSelect) {
      onDateRangeSelect(null);
    }
  }, [onDateSelect, onDateRangeSelect]);
  
  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedDate(null);
    setRangeStart(null);
    setRangeEnd(null);
    setRangeSelectionInProgress(false);
    
    if (onDateSelect) {
      onDateSelect(null);
    }
    
    if (onDateRangeSelect) {
      onDateRangeSelect(null);
    }
  }, [onDateSelect, onDateRangeSelect]);
  
  // Get reference area coordinates for visualization
  const getReferenceAreaCoordinates = useCallback(() => {
    if (!rangeStart || !rangeEnd) return null;
    
    const dateA = new Date(rangeStart);
    const dateB = new Date(rangeEnd);
    
    if (dateA <= dateB) {
      return { x1: rangeStart, x2: rangeEnd };
    } else {
      return { x1: rangeEnd, x2: rangeStart };
    }
  }, [rangeStart, rangeEnd]);
  
  // Get temporary reference area during selection
  const getTemporaryReferenceArea = useCallback(() => {
    if (!rangeSelectionInProgress || !rangeStart || !hoveredDate) return null;
    
    const dateA = new Date(rangeStart);
    const dateB = new Date(hoveredDate);
    
    if (dateA <= dateB) {
      return { x1: rangeStart, x2: hoveredDate };
    } else {
      return { x1: hoveredDate, x2: rangeStart };
    }
  }, [rangeSelectionInProgress, rangeStart, hoveredDate]);
  
  // Render loading state
  if (loading) {
    return <div>Loading timeline data...</div>;
  }
  
  // Render error state
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <TimelineContainer>
      <TimelineHeader>
        <Title>Market Timeline {symbol && `- ${symbol}`}</Title>
        <Controls>
          <Button 
            active={timeRange === '1W'} 
            onClick={() => handleTimeRangeChange('1W')}
          >
            1W
          </Button>
          <Button 
            active={timeRange === '1M'} 
            onClick={() => handleTimeRangeChange('1M')}
          >
            1M
          </Button>
          <Button 
            active={timeRange === '3M'} 
            onClick={() => handleTimeRangeChange('3M')}
          >
            3M
          </Button>
          <Button 
            active={timeRange === '1Y'} 
            onClick={() => handleTimeRangeChange('1Y')}
          >
            1Y
          </Button>
          <SelectionControls>
            <SelectionModeButton 
              active={selectionMode === 'point'} 
              onClick={() => handleSelectionModeChange('point')}
            >
              Point
            </SelectionModeButton>
            <SelectionModeButton 
              active={selectionMode === 'range'} 
              onClick={() => handleSelectionModeChange('range')}
            >
              Range
            </SelectionModeButton>
            <ClearButton onClick={handleClearSelection}>
              Clear
            </ClearButton>
          </SelectionControls>
        </Controls>
      </TimelineHeader>
      
      <ChartContainer ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            onClick={handleChartClick}
            onMouseMove={(e) => {
              if (rangeSelectionInProgress) {
                handleMouseMove(e.nativeEvent);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--text-secondary)' }}
              tickLine={{ stroke: 'var(--text-secondary)' }}
            />
            <YAxis 
              yAxisId="left"
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--text-secondary)' }}
              tickLine={{ stroke: 'var(--text-secondary)' }}
              label={{ 
                value: 'Price / Sentiment', 
                angle: -90, 
                position: 'insideLeft',
                fill: 'var(--text-secondary)'
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'var(--text-secondary)' }}
              tickLine={{ stroke: 'var(--text-secondary)' }}
              label={{ 
                value: 'Volume', 
                angle: 90, 
                position: 'insideRight',
                fill: 'var(--text-secondary)'
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--tooltip-background)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                color: 'var(--text-secondary)'
              }} 
            />
            <Bar 
              dataKey="volume" 
              fill="rgba(100, 100, 255, 0.3)" 
              name="Volume"
              yAxisId="right" 
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              name="Price"
              strokeWidth={2}
              dot={false}
              yAxisId="left" 
            />
            <Line 
              type="monotone" 
              dataKey="sentiment" 
              stroke="#82ca9d" 
              name="Sentiment"
              strokeWidth={2}
              dot={false}
              yAxisId="left" 
            />
            <Scatter 
              dataKey="newsCount" 
              fill="#ff7300" 
              name="News Events"
              yAxisId="left"
              shape={(props) => {
                const { cx, cy } = props;
                return props.payload.newsCount > 0 ? (
                  <circle cx={cx} cy={cy} r={4} fill="#ff7300" />
                ) : null;
              }}
            />
            
            {/* Point selection indicator */}
            {selectedDate && (
              <ReferenceLine 
                x={selectedDate} 
                stroke="#ff7300" 
                strokeWidth={2}
                yAxisId="left"
              />
            )}
            
            {/* Range selection first point indicator */}
            {rangeSelectionInProgress && rangeStart && (
              <ReferenceLine 
                x={rangeStart} 
                stroke="#ff7300" 
                strokeWidth={2}
                strokeDasharray="5 5"
                yAxisId="left"
              />
            )}
            
            {/* Range selection in progress indicator */}
            {rangeSelectionInProgress && rangeStart && hoveredDate && getTemporaryReferenceArea() && (
              <ReferenceArea 
                {...getTemporaryReferenceArea()}
                fill="#ff7300" 
                fillOpacity={0.2} 
                stroke="#ff7300"
                strokeWidth={1}
                strokeDasharray="3 3"
                yAxisId="left"
              />
            )}
            
            {/* Final range selection indicator */}
            {rangeStart && rangeEnd && !rangeSelectionInProgress && getReferenceAreaCoordinates() && (
              <ReferenceArea 
                {...getReferenceAreaCoordinates()}
                fill="#ff7300" 
                fillOpacity={0.3} 
                stroke="#ff7300"
                strokeWidth={1}
                yAxisId="left"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      <SelectionInfo>
        {selectedDate && (
          <div>Selected Date: <strong>{selectedDate}</strong></div>
        )}
        {rangeStart && rangeEnd && getReferenceAreaCoordinates() && (
          <div>
            Selected Range: <strong>{getReferenceAreaCoordinates().x1}</strong> to <strong>{getReferenceAreaCoordinates().x2}</strong>
          </div>
        )}
      </SelectionInfo>
    </TimelineContainer>
  );
};

export default Timeline;
