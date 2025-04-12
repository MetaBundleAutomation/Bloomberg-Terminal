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

const NewsFeed = ({ 
  onNewsClick, 
  symbol = 'GENERAL', 
  dataSource,
  selectedDate = null,
  selectedDateRange = null
}) => {
  const [newsData, setNewsData] = useState([]);
  const [filteredNewsData, setFilteredNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const newsRefs = useRef({});
  
  // Fetch news data from the API
  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the correct API endpoint format from the backend
        const endpoint = `http://localhost:8001/api/news?symbol=${symbol || 'GENERAL'}&days=30`;
        console.log('Fetching news data from:', endpoint);
        
        const response = await axios.get(endpoint);
        console.log('News data received:', response.data);
        setNewsData(response.data);
        
        // Initialize filtered data with all news
        filterNewsData(response.data, selectedDate, selectedDateRange);
      } catch (err) {
        console.error('Error fetching news data:', err);
        setError('Failed to load news data. Please try again later.');
        setNewsData([]);
        setFilteredNewsData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsData();
  }, [symbol, dataSource]);
  
  // Helper function to filter news data
  const filterNewsData = (data, date, dateRange) => {
    console.log("Filtering news data:", { date, dateRange, dataLength: data.length });
    
    let filtered = [...data];
    
    if (date) {
      console.log("Filtering for specific date:", date);
      // For point selection, use exact date matching
      filtered = data.filter(news => {
        // Extract just the date part for comparison (no time)
        const newsDateStr = news.date.split('T')[0];
        return newsDateStr === date;
      });
      console.log(`Found ${filtered.length} news items for date ${date}`);
    } else if (dateRange) {
      console.log("Filtering for date range:", dateRange);
      const { startDate, endDate, displayEndDate } = dateRange;
      
      // Extract just the date part for comparison (no time)
      // We want to include all news from startDate up to and including displayEndDate
      // This is a string comparison which is more reliable than Date objects for this case
      filtered = data.filter(news => {
        const newsDateStr = news.date.split('T')[0];
        
        // Debug log for each news item
        if (newsDateStr === '2025-04-06') {
          console.log(`News from 2025-04-06 being checked`);
          console.log(`- Start date: ${startDate}`);
          console.log(`- Display end date: ${displayEndDate}`);
          console.log(`- Is >= start: ${newsDateStr >= startDate}`);
          console.log(`- Is <= display end: ${newsDateStr <= displayEndDate}`);
        }
        
        // Simple string comparison - include if news date is between start and display end (inclusive)
        return newsDateStr >= startDate && newsDateStr <= displayEndDate;
      });
      
      console.log(`Filtering between ${startDate} and ${displayEndDate} (inclusive)`);
      console.log(`Found ${filtered.length} news items in range`);
    }
    
    console.log("Filtered news count:", filtered.length);
    setFilteredNewsData(filtered);
  };
  
  // Filter news based on selected date/range
  useEffect(() => {
    if (!newsData.length) return;
    
    console.log("Selection changed, filtering news with:", { selectedDate, selectedDateRange });
    filterNewsData(newsData, selectedDate, selectedDateRange);
    
    // Scroll to the first news item that matches the selected date
    if (selectedDate) {
      setTimeout(() => {
        const matchingNews = newsData.find(news => news.date === selectedDate);
        if (matchingNews && newsRefs.current[matchingNews.id]) {
          newsRefs.current[matchingNews.id].scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [newsData, selectedDate, selectedDateRange]);
  
  const handleNewsClick = (newsItem) => {
    if (onNewsClick) {
      onNewsClick(newsItem);
    }
  };
  
  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.3) return 'Positive';
    if (sentiment < -0.3) return 'Negative';
    return 'Neutral';
  };
  
  // Get title based on current selection
  const getNewsTitle = () => {
    if (selectedDate) {
      return `Market News for ${selectedDate}`;
    } else if (selectedDateRange) {
      // For display, use the original end date (before we adjusted it to the next day)
      const displayEndDate = selectedDateRange.displayEndDate || selectedDateRange.endDate;
      
      return `Market News from ${selectedDateRange.startDate} to ${displayEndDate}`;
    } else {
      return `Market News ${symbol !== 'GENERAL' ? `for ${symbol}` : ''}`;
    }
  };
  
  return (
    <NewsFeedContainer>
      <NewsFeedHeader>
        <Title>{getNewsTitle()} {loading && '(Loading...)'}</Title>
      </NewsFeedHeader>
      
      {error && (
        <div style={{ color: 'orange', marginBottom: '10px' }}>{error}</div>
      )}
      
      {(selectedDate || selectedDateRange) && filteredNewsData.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No news articles found for the selected {selectedDate ? 'date' : 'date range'}.
        </div>
      )}
      
      <NewsItemList>
        {filteredNewsData.length > 0 ? (
          filteredNewsData.map(news => (
            <NewsItem 
              key={news.id} 
              sentiment={news.sentiment}
              onClick={() => handleNewsClick(news)}
              ref={el => newsRefs.current[news.id] = el}
              highlighted={selectedDate === news.date}
            >
              <NewsContent>
                <NewsTitle>{news.title}</NewsTitle>
                <NewsSource>
                  <span>{news.source}</span>
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
              highlighted={selectedDate === news.date}
            >
              <NewsContent>
                <NewsTitle>{news.title}</NewsTitle>
                <NewsSource>
                  <span>{news.source}</span>
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
    </NewsFeedContainer>
  );
};

export default NewsFeed;
