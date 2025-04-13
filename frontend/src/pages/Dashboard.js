import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Timeline from '../components/Timeline';
import NewsFeed from '../components/NewsFeed';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

const TimelineSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const DataSourceSelector = styled.div`
  display: flex;
  gap: 10px;
  position: relative;
`;

const SelectorButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--card-background)'};
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#444'};
  }
`;

const DataSourcePopup = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background-color: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 16px;
  z-index: 10;
  min-width: 300px;
`;

const PopupHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
`;

const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const SourceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(33, 150, 243, 0.1);
  }
  
  ${props => props.selected && `
    background-color: rgba(33, 150, 243, 0.2);
    border-left: 3px solid var(--primary-color);
  `}
`;

const SourceIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color || 'var(--primary-color)'};
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
`;

const SourceInfo = styled.div`
  flex: 1;
`;

const SourceName = styled.div`
  font-weight: 500;
`;

const SourceDetails = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

const FileUploadSection = styled.div`
  padding: 20px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  text-align: center;
  transition: border-color 0.3s;
  background-color: rgba(45, 45, 45, 0.5);
  
  ${props => props.isDragActive && `
    border-color: var(--primary-color);
    background-color: rgba(33, 150, 243, 0.05);
  `}
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 16px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #1976d2;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
  color: #aaa;
`;

const UploadText = styled.div`
  margin-bottom: 16px;
  color: #aaa;
`;

const FileInfo = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: rgba(45, 45, 45, 0.8);
  border-radius: 4px;
  text-align: left;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const FileName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const FileSize = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

const NewsSection = styled.div`
  width: 100%;
`;

const DeepDiveSection = styled.div`
  width: 100%;
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const DeepDivePrompt = styled.p`
  font-size: 1.2rem;
  color: #aaa;
  margin: 0;
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
  const [dataSource, setDataSource] = useState('stock');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedStock, setSelectedStock] = useState(stockOptions[0]);
  const [selectedEtf, setSelectedEtf] = useState(etfOptions[0]);
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const fileInputRef = useRef(null);
  
  // Debug state changes
  useEffect(() => {
    console.log("Dashboard state updated:", { 
      selectedDate, 
      selectedDateRange, 
      dataSource,
      symbol: getCurrentSymbol()
    });
  }, [selectedDate, selectedDateRange, dataSource, selectedStock, selectedEtf, file]);
  
  // Determine the current symbol based on the data source
  const getCurrentSymbol = () => {
    if (dataSource === 'stock') {
      return selectedStock.symbol;
    } else if (dataSource === 'etf') {
      return selectedEtf.symbol;
    } else if (dataSource === 'csv' && file) {
      return file.name.replace('.csv', '');
    }
    return 'GENERAL';
  };
  
  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
  };
  
  const closeModal = () => {
    setSelectedNews(null);
  };
  
  const handleDataSourceClick = (source) => {
    setDataSource(source);
    setShowPopup(true);
  };
  
  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setShowPopup(false);
    // Reset selections when data source changes
    setSelectedDate(null);
    setSelectedDateRange(null);
  };
  
  const handleEtfSelect = (etf) => {
    setSelectedEtf(etf);
    setShowPopup(false);
    // Reset selections when data source changes
    setSelectedDate(null);
    setSelectedDateRange(null);
  };
  
  const handleDateSelect = (date) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
    setSelectedDateRange(null);
  };
  
  const handleDateRangeSelect = (dateRange) => {
    console.log("Date range selected:", dateRange);
    setSelectedDateRange(dateRange);
    setSelectedDate(null);
  };
  
  const handleFileClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = () => {
    setIsDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      alert('Please drop a valid CSV file');
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };
  
  const handleUpload = () => {
    // In a real app, this would upload the file to the server
    alert(`File "${file.name}" would be uploaded to the server.`);
  };
  
  const closePopup = () => {
    setShowPopup(false);
  };
  
  const renderDataSourceContent = () => {
    if (dataSource === 'csv') {
      return (
        <FileUploadSection 
          isDragActive={isDragActive}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileClick}
        >
          <FileInput 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <UploadIcon>📊</UploadIcon>
          <UploadText>
            Drag & drop a CSV file here, or click to select
          </UploadText>
          <UploadButton disabled={!file} onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
            {file ? 'Upload File' : 'Select a CSV file'}
          </UploadButton>
          
          <FileInfo visible={!!file}>
            {file && (
              <>
                <FileName>{file.name}</FileName>
                <FileSize>{formatFileSize(file.size)}</FileSize>
              </>
            )}
          </FileInfo>
        </FileUploadSection>
      );
    }
    
    return (
      <Timeline 
        dataSource={dataSource} 
        symbol={getCurrentSymbol()} 
        onDateSelect={handleDateSelect}
        onDateRangeSelect={handleDateRangeSelect}
      />
    );
  };
  
  return (
    <DashboardContainer onClick={() => showPopup && closePopup()}>
      <TimelineSection>
        <TimelineHeader>
          <h2>Market Timeline</h2>
          <DataSourceSelector>
            <SelectorButton 
              active={dataSource === 'stock'} 
              onClick={(e) => { e.stopPropagation(); handleDataSourceClick('stock'); }}
            >
              Stock {dataSource === 'stock' && `(${selectedStock.symbol})`}
            </SelectorButton>
            <SelectorButton 
              active={dataSource === 'etf'} 
              onClick={(e) => { e.stopPropagation(); handleDataSourceClick('etf'); }}
            >
              ETF {dataSource === 'etf' && `(${selectedEtf.symbol})`}
            </SelectorButton>
            <SelectorButton 
              active={dataSource === 'csv'} 
              onClick={(e) => { e.stopPropagation(); setDataSource('csv'); setShowPopup(false); }}
            >
              Upload CSV
            </SelectorButton>
            
            {showPopup && dataSource === 'stock' && (
              <DataSourcePopup onClick={(e) => e.stopPropagation()}>
                <PopupHeader>Select Stock</PopupHeader>
                <SourceList>
                  {stockOptions.map(stock => (
                    <SourceItem 
                      key={stock.id} 
                      selected={selectedStock.id === stock.id}
                      onClick={() => handleStockSelect(stock)}
                    >
                      <SourceIcon color={stock.color}>{stock.symbol.charAt(0)}</SourceIcon>
                      <SourceInfo>
                        <SourceName>{stock.name}</SourceName>
                        <SourceDetails>{stock.symbol} • {stock.exchange}</SourceDetails>
                      </SourceInfo>
                    </SourceItem>
                  ))}
                </SourceList>
              </DataSourcePopup>
            )}
            
            {showPopup && dataSource === 'etf' && (
              <DataSourcePopup onClick={(e) => e.stopPropagation()}>
                <PopupHeader>Select ETF</PopupHeader>
                <SourceList>
                  {etfOptions.map(etf => (
                    <SourceItem 
                      key={etf.id} 
                      selected={selectedEtf.id === etf.id}
                      onClick={() => handleEtfSelect(etf)}
                    >
                      <SourceIcon color={etf.color}>{etf.symbol.charAt(0)}</SourceIcon>
                      <SourceInfo>
                        <SourceName>{etf.name}</SourceName>
                        <SourceDetails>{etf.symbol} • {etf.type}</SourceDetails>
                      </SourceInfo>
                    </SourceItem>
                  ))}
                </SourceList>
              </DataSourcePopup>
            )}
          </DataSourceSelector>
        </TimelineHeader>
        
        {renderDataSourceContent()}
      </TimelineSection>
      
      <NewsSection>
        <NewsFeed 
          key={`news-${selectedDate || 'none'}-${selectedDateRange ? JSON.stringify(selectedDateRange) : 'none'}`}
          onNewsClick={handleNewsClick} 
          symbol={getCurrentSymbol()}
          dataSource={dataSource}
          selectedDate={selectedDate}
          selectedDateRange={selectedDateRange}
        />
      </NewsSection>
      
      <DeepDiveSection>
        <DeepDivePrompt>
          {selectedDate ? (
            <>Selected Date: <strong>{selectedDate}</strong></>
          ) : selectedDateRange ? (
            <>Selected Range: <strong>{selectedDateRange.startDate}</strong> to <strong>{selectedDateRange.endDate}</strong></>
          ) : (
            'Click a point on the timeline to see a breakdown of market context and sentiment.'
          )}
        </DeepDivePrompt>
      </DeepDiveSection>
      
      {selectedNews && (
        <NewsModal onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedNews.title}</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            <NewsSource>
              <span>{selectedNews.source}</span>
              <span>{selectedNews.display_date || selectedNews.date}</span>
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
            
            {selectedNews.articleData && selectedNews.articleData.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '15px' }}>
                <h3 style={{ marginBottom: '10px' }}>Article Data</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {selectedNews.articleData.map(({ key, value }) => (
                      <tr key={key} style={{ 
                        backgroundColor: key % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent' 
                      }}>
                        <td style={{ 
                          padding: '8px 12px', 
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold',
                          width: '150px',
                          color: 'var(--accent-color)'
                        }}>{key}</td>
                        <td style={{ 
                          padding: '8px 12px', 
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {selectedNews.rawDataJson && (
              <div style={{ marginTop: '20px' }}>
                <pre style={{ 
                  backgroundColor: '#1e1e1e',
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  color: '#e6e6e6',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  maxHeight: '200px'
                }}>
                  {selectedNews.rawDataJson}
                </pre>
              </div>
            )}
            
            {selectedNews.link && (
              <a 
                href={selectedNews.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '15px',
                  color: 'var(--accent-color)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  border: '1px solid var(--accent-color)',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                Read Full Article
              </a>
            )}
          </ModalContent>
        </NewsModal>
      )}
    </DashboardContainer>
  );
};

// Mock data for stocks
const stockOptions = [
  { id: 'aapl', name: 'Apple Inc.', symbol: 'AAPL', exchange: 'NASDAQ', color: '#1E88E5' },
  { id: 'msft', name: 'Microsoft Corporation', symbol: 'MSFT', exchange: 'NASDAQ', color: '#43A047' },
  { id: 'googl', name: 'Alphabet Inc.', symbol: 'GOOGL', exchange: 'NASDAQ', color: '#E53935' },
  { id: 'amzn', name: 'Amazon.com, Inc.', symbol: 'AMZN', exchange: 'NASDAQ', color: '#FB8C00' },
  { id: 'tsla', name: 'Tesla, Inc.', symbol: 'TSLA', exchange: 'NASDAQ', color: '#8E24AA' },
  { id: 'meta', name: 'Meta Platforms, Inc.', symbol: 'META', exchange: 'NASDAQ', color: '#3949AB' },
  { id: 'nvda', name: 'NVIDIA Corporation', symbol: 'NVDA', exchange: 'NASDAQ', color: '#00ACC1' },
  { id: 'jpm', name: 'JPMorgan Chase & Co.', symbol: 'JPM', exchange: 'NYSE', color: '#5E35B1' }
];

// Mock data for ETFs
const etfOptions = [
  { id: 'spy', name: 'SPDR S&P 500 ETF Trust', symbol: 'SPY', type: 'Large Cap Equity', color: '#1E88E5' },
  { id: 'qqq', name: 'Invesco QQQ Trust', symbol: 'QQQ', type: 'Technology', color: '#43A047' },
  { id: 'voo', name: 'Vanguard S&P 500 ETF', symbol: 'VOO', type: 'Large Cap Equity', color: '#E53935' },
  { id: 'vti', name: 'Vanguard Total Stock Market ETF', symbol: 'VTI', type: 'Total Market', color: '#FB8C00' },
  { id: 'agg', name: 'iShares Core U.S. Aggregate Bond ETF', symbol: 'AGG', type: 'Bond', color: '#8E24AA' },
  { id: 'vea', name: 'Vanguard FTSE Developed Markets ETF', symbol: 'VEA', type: 'International', color: '#3949AB' },
  { id: 'vwo', name: 'Vanguard FTSE Emerging Markets ETF', symbol: 'VWO', type: 'Emerging Markets', color: '#00ACC1' },
  { id: 'bnd', name: 'Vanguard Total Bond Market ETF', symbol: 'BND', type: 'Bond', color: '#5E35B1' }
];

export default Dashboard;
