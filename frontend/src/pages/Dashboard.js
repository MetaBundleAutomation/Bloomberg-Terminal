import React, { useState } from 'react';
import styled from 'styled-components';
import Timeline from '../components/Timeline';
import MarketChart from '../components/MarketChart';
import NewsFeed from '../components/NewsFeed';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  padding: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SideContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const NewsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 24px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const NewsSource = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 16px;
`;

const NewsSummary = styled.div`
  margin-bottom: 24px;
  line-height: 1.6;
`;

const SentimentAnalysis = styled.div`
  background-color: rgba(45, 45, 45, 0.5);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const SentimentHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 12px;
  color: var(--text-color);
`;

const SentimentMeter = styled.div`
  height: 8px;
  background-color: #444;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;
    width: ${props => Math.abs(props.sentiment * 50)}%;
    background-color: ${props => props.sentiment > 0 ? 'var(--positive-color)' : 'var(--negative-color)'};
    transform: ${props => props.sentiment > 0 ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SentimentLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #aaa;
`;

const Dashboard = () => {
  const [selectedNews, setSelectedNews] = useState(null);
  
  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
  };
  
  const closeModal = () => {
    setSelectedNews(null);
  };
  
  return (
    <DashboardContainer>
      <MainContent>
        <Timeline />
        <MarketChart />
      </MainContent>
      
      <SideContent>
        <NewsFeed onNewsClick={handleNewsClick} />
      </SideContent>
      
      {selectedNews && (
        <NewsModal onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedNews.title}</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            <NewsSource>
              <span>{selectedNews.source}</span>
              <span>{selectedNews.date}</span>
            </NewsSource>
            
            <NewsSummary>
              {selectedNews.summary}
            </NewsSummary>
            
            <SentimentAnalysis>
              <SentimentHeader>Sentiment Analysis</SentimentHeader>
              <SentimentMeter sentiment={selectedNews.sentiment} />
              <SentimentLabel>
                <span>Negative</span>
                <span>Neutral</span>
                <span>Positive</span>
              </SentimentLabel>
            </SentimentAnalysis>
          </ModalContent>
        </NewsModal>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
