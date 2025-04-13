import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const NewsFeedContainer = styled.div`
  width: 100%;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  max-width: 100%;
`;

const NewsFeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
`;

const NewsItemList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--card-background);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--accent-color);
  }
`;

const NewsItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  background-color: ${props => props.highlighted ? 'var(--highlight-background)' : 'transparent'};
  
  &:hover {
    background-color: var(--hover-background);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NewsContent = styled.div`
  flex: 1;
  padding-right: 16px;
`;

const NewsTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--text-primary);
`;

const NewsSource = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const NewsMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 100px;
`;

const NewsDate = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const SentimentBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => {
    if (props.sentiment > 0.3) return 'var(--positive-color)';
    if (props.sentiment < -0.3) return 'var(--negative-color)';
    return 'var(--neutral-color)';
  }};
  color: white;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoadingSpinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top: 8px solid var(--accent-color);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  margin-top: 16px;
`;

const NewsFeed = ({ 
  onNewsClick, 
  symbol = 'GENERAL', 
  dataSource = 'live',
  selectedDate = null,
  selectedDateRange = null
}) => {
  const [newsData, setNewsData] = useState([]);
  const [filteredNewsData, setFilteredNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const newsRefs = useRef({});
  
  // Force remounting the component when date selection changes by using a keyed component
  useEffect(() => {
    console.log(`Date selection changed: Date=${selectedDate}, Range=${JSON.stringify(selectedDateRange)}`);
    
    // Re-fetch news data whenever the date selection changes
    fetchNewsData();
  }, [selectedDate, selectedDateRange]);
  
  // Fetch news data from the API
  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint;
      
      // Log dates for debugging
      console.log('Fetch news with dates:', {
        selectedDate: selectedDate,
        selectedDateRange: selectedDateRange,
        dateType: selectedDate ? typeof selectedDate : 'null',
        rangeType: selectedDateRange ? 'object' : 'null'
      });
      
      // Special case: When a date point is clicked, the Timeline component
      // actually creates a dateRange where start and end are the same day
      if (selectedDateRange && selectedDateRange.startDate === selectedDateRange.endDate) {
        // This is actually a point selection, use the date endpoint
        const singleDate = selectedDateRange.startDate;
        
        // Ensure date is in YYYY-MM-DD format
        const formattedDate = typeof singleDate === 'string' ? singleDate : 
          (singleDate instanceof Date ? singleDate.toISOString().split('T')[0] : null);
          
        if (!formattedDate) {
          console.error('Invalid date format for single date:', singleDate);
          throw new Error('Invalid date format');
        }
          
        endpoint = `http://localhost:8002/api/news/date?symbol=${symbol || 'GENERAL'}&date=${formattedDate}`;
        console.log('Fetching single date (from range) news data:', endpoint);
      }
      // Regular point selection (unlikely to happen with current Timeline implementation)
      else if (selectedDate) {
        // Ensure date is in YYYY-MM-DD format
        const formattedDate = typeof selectedDate === 'string' ? selectedDate : 
          (selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : null);
          
        if (!formattedDate) {
          console.error('Invalid date format for selected date:', selectedDate);
          throw new Error('Invalid date format');
        }
        
        // Use the specific date endpoint for point selection
        endpoint = `http://localhost:8002/api/news/date?symbol=${symbol || 'GENERAL'}&date=${formattedDate}`;
        console.log('Fetching single date news data from:', endpoint);
      } 
      // Regular date range selection
      else if (selectedDateRange) {
        // Ensure dates are in YYYY-MM-DD format
        const formattedStartDate = typeof selectedDateRange.startDate === 'string' ? selectedDateRange.startDate : 
          (selectedDateRange.startDate instanceof Date ? selectedDateRange.startDate.toISOString().split('T')[0] : null);
          
        const formattedEndDate = selectedDateRange.displayEndDate || selectedDateRange.endDate;
        const formattedDisplayEndDate = typeof formattedEndDate === 'string' ? formattedEndDate : 
          (formattedEndDate instanceof Date ? formattedEndDate.toISOString().split('T')[0] : null);
          
        if (!formattedStartDate || !formattedDisplayEndDate) {
          console.error('Invalid date format for date range:', selectedDateRange);
          throw new Error('Invalid date range format');
        }
        
        // Use the date range specific endpoint
        endpoint = `http://localhost:8002/api/news/date-range?symbol=${symbol || 'GENERAL'}&start_date=${formattedStartDate}&end_date=${formattedDisplayEndDate}`;
        console.log('Fetching date range news data from:', endpoint);
      } 
      // Default case - no date selection
      else {
        // Use the standard news endpoint
        const days = dataSource === 'historical' ? 365 : 30;
        endpoint = `http://localhost:8002/api/news?symbol=${symbol || 'GENERAL'}&days=${days}`;
        console.log('Fetching general news data from:', endpoint);
      }
      
      // Clear existing data while loading
      setNewsData([]);
      setFilteredNewsData([]);
      
      const response = await axios.get(endpoint);
      console.log('News data received:', response.data.length, 'articles');
      
      // Validate that we got actual articles
      if (!Array.isArray(response.data) || response.data.length === 0) {
        console.warn('No articles returned from API');
      } else {
        // Log the first article to see what dates we're getting
        console.log('Sample article date:', response.data[0].date);
      }
      
      setNewsData(response.data);
      
      // Since we're using specific endpoints, we can just use the raw results
      setFilteredNewsData(response.data);
    } catch (err) {
      console.error('Error fetching news data:', err);
      setError('Failed to load news data. Please try again later.');
      setNewsData([]);
      setFilteredNewsData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load 
  useEffect(() => {
    // Only fetch if the symbol or data source changes, not date selections
    // Date selection changes are handled by the dedicated effect above
    fetchNewsData();
  }, [symbol, dataSource]);
  
  // Filter news based on selected date/range
  useEffect(() => {
    if (!newsData.length) return;
    
    console.log("Selection changed, filtering news with:", { selectedDate, selectedDateRange });
    // No need to filter news data here, as we're using specific endpoints
  }, [newsData, selectedDate, selectedDateRange]);
  
  const handleNewsClick = (newsItem) => {
    // Enhanced news item with all raw data for the popup
    const enhancedNewsItem = {
      ...newsItem,
      // Add any additional formatting or data needed for the popup here
      articleData: newsItem.raw_data ? Object.entries(newsItem.raw_data)
        .filter(([key, value]) => typeof value !== 'object')
        .map(([key, value]) => ({ key, value: String(value) }))
        : [],
      rawDataJson: newsItem.raw_data ? JSON.stringify(newsItem.raw_data, null, 2) : '{}'
    };
    
    // Pass the enhanced news item to the Dashboard's handler
    if (onNewsClick) {
      onNewsClick(enhancedNewsItem);
    }
  };
  
  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };
  
  const getSentimentClass = (sentiment) => {
    if (sentiment > 0.2) return 'positive';
    if (sentiment < -0.2) return 'negative';
    return 'neutral';
  };
  
  if (loading) {
    return (
      <NewsFeedContainer>
        <NewsFeedHeader>
          <Title>News Feed</Title>
        </NewsFeedHeader>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading news for selected date...</LoadingText>
        </LoadingContainer>
      </NewsFeedContainer>
    );
  }
  
  return (
    <NewsFeedContainer>
      <NewsFeedHeader>
        <Title>News Feed</Title>
      </NewsFeedHeader>
      
      {error ? (
        <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>
      ) : filteredNewsData.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No news articles found for the selected {selectedDate ? 'date' : 'date range'}.
        </div>
      ) : (
        <NewsItemList>
          {filteredNewsData.length > 0 ? (
            filteredNewsData.map(news => (
              <NewsItem 
                key={news.id} 
                sentiment={news.sentiment}
                onClick={() => handleNewsClick(news)}
                ref={el => newsRefs.current[news.id] = el}
              >
                <NewsContent>
                  <NewsTitle>{news.title}</NewsTitle>
                  <NewsSource>
                    <span>{news.source}</span>
                    {news.display_date && <span> • {news.display_date}</span>}
                  </NewsSource>
                </NewsContent>
                <NewsMeta>
                  <NewsDate>{news.date}</NewsDate>
                  <SentimentBadge sentiment={news.sentiment}>
                    {getSentimentLabel(news.sentiment)}
                  </SentimentBadge>
                </NewsMeta>
              </NewsItem>
            ))
          ) : !selectedDate && !selectedDateRange ? (
            newsData.map(news => (
              <NewsItem 
                key={news.id} 
                sentiment={news.sentiment}
                onClick={() => handleNewsClick(news)}
                ref={el => newsRefs.current[news.id] = el}
              >
                <NewsContent>
                  <NewsTitle>{news.title}</NewsTitle>
                  <NewsSource>
                    <span>{news.source}</span>
                    {news.display_date && <span> • {news.display_date}</span>}
                  </NewsSource>
                </NewsContent>
                <NewsMeta>
                  <NewsDate>{news.date}</NewsDate>
                  <SentimentBadge sentiment={news.sentiment}>
                    {getSentimentLabel(news.sentiment)}
                  </SentimentBadge>
                </NewsMeta>
              </NewsItem>
            ))
          ) : null}
        </NewsItemList>
      )}
    </NewsFeedContainer>
  );
};

export default NewsFeed;
