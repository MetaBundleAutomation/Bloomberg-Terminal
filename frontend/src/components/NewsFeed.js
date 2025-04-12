import React from 'react';
import styled from 'styled-components';

const NewsFeedContainer = styled.div`
  width: 100%;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
`;

const NewsFeedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: var(--text-color);
`;

const NewsItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const NewsItem = styled.div`
  display: flex;
  padding: 12px;
  border-radius: 6px;
  background-color: rgba(45, 45, 45, 0.5);
  border-left: 4px solid ${props => 
    props.sentiment > 0.3 ? 'var(--positive-color)' : 
    props.sentiment < -0.3 ? 'var(--negative-color)' : 
    'var(--neutral-color)'};
  transition: background-color 0.2s;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(55, 55, 55, 0.8);
  }
`;

const NewsContent = styled.div`
  flex: 1;
`;

const NewsTitle = styled.h4`
  margin: 0 0 8px 0;
  color: var(--text-color);
`;

const NewsSource = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #aaa;
`;

const NewsMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  min-width: 80px;
`;

const NewsDate = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

const SentimentBadge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => 
    props.sentiment > 0.3 ? 'rgba(76, 175, 80, 0.2)' : 
    props.sentiment < -0.3 ? 'rgba(244, 67, 54, 0.2)' : 
    'rgba(158, 158, 158, 0.2)'};
  color: ${props => 
    props.sentiment > 0.3 ? 'var(--positive-color)' : 
    props.sentiment < -0.3 ? 'var(--negative-color)' : 
    'var(--neutral-color)'};
`;

// Mock data - this would come from your API
const mockNewsData = [
  {
    id: 1,
    title: 'Tech Stocks Surge as AI Adoption Accelerates',
    source: 'Financial Times',
    date: '2025-04-12',
    sentiment: 0.8,
    summary: 'Technology stocks saw significant gains today as reports indicate faster-than-expected adoption of AI technologies across multiple industries.'
  },
  {
    id: 2,
    title: 'Federal Reserve Signals Potential Rate Hike',
    source: 'Wall Street Journal',
    date: '2025-04-11',
    sentiment: -0.5,
    summary: 'The Federal Reserve has indicated it may raise interest rates in response to persistent inflation concerns, causing market uncertainty.'
  },
  {
    id: 3,
    title: 'Global Supply Chain Issues Begin to Ease',
    source: 'Bloomberg',
    date: '2025-04-10',
    sentiment: 0.6,
    summary: 'After months of disruption, global supply chains are showing signs of improvement as shipping bottlenecks clear and production normalizes.'
  },
  {
    id: 4,
    title: 'Oil Prices Stabilize Following Production Agreement',
    source: 'Reuters',
    date: '2025-04-09',
    sentiment: 0.2,
    summary: 'Major oil-producing nations reached an agreement on production levels, leading to stabilization in global oil prices after weeks of volatility.'
  },
  {
    id: 5,
    title: 'Retail Sales Decline for Second Consecutive Month',
    source: 'CNBC',
    date: '2025-04-08',
    sentiment: -0.7,
    summary: 'Consumer spending continues to slow as retail sales figures show a decline for the second month in a row, raising concerns about economic growth.'
  }
];

const NewsFeed = ({ onNewsClick }) => {
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
  
  return (
    <NewsFeedContainer>
      <NewsFeedHeader>
        <Title>Market News</Title>
      </NewsFeedHeader>
      
      <NewsItemList>
        {mockNewsData.map(news => (
          <NewsItem 
            key={news.id} 
            sentiment={news.sentiment}
            onClick={() => handleNewsClick(news)}
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
        ))}
      </NewsItemList>
    </NewsFeedContainer>
  );
};

export default NewsFeed;
