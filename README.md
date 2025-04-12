# VIBE - Visual Interactive Bloomberg Experience

VIBE is a modern, interactive financial data visualization platform that combines market data with news sentiment analysis to provide insights into market trends and human sentiment over time.

## Project Overview

VIBE provides a comprehensive view of financial markets by integrating:
- Interactive timeline visualization
- Market data (OHLCV) charts
- News article analysis with sentiment scoring
- Correlation between market movements and news sentiment

## Core Modules

### 1. Frontend (React)
- Timeline component using D3.js/Recharts
- Market charts (candlestick + volume)
- News bubble overlays (clickable)
- Sentiment line overlay
- Drill-down modal with news list and AI summaries

### 2. Backend (FastAPI)
- Time-based queries
- Data endpoints for market data, news, and sentiment
- News article summaries
- Sentiment scoring pipeline

### 3. Data Layer
- Market Data: IEX Cloud / Quando
- News Data: GDELT CSVs
- Databases:
  - PostgreSQL for structured data
  - TimescaleDB for time-series data

### 4. Processing Scripts
- GDELT CSV processing
- Sentiment scoring (VADER or BERT)
- News-to-ticker matching
- Database storage utilities

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/MetaBundleAutomation/Bloomberg-Terminal.git
cd Bloomberg-Terminal
```

2. Start the development environment:
```bash
docker-compose up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Development

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Data Processing
```bash
cd data_processing
pip install -r requirements.txt
python process_gdelt.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
