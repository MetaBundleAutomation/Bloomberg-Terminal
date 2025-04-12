from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import random
from pydantic import BaseModel

app = FastAPI(title="VIBE API", description="Visual Interactive Bloomberg Experience API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MarketData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class NewsItem(BaseModel):
    id: int
    title: str
    source: str
    date: str
    sentiment: float
    summary: str
    url: Optional[str] = None

class TimelineData(BaseModel):
    date: str
    price: float
    volume: int
    sentiment: float
    newsCount: int
    news: Optional[NewsItem] = None

# Mock data generators
def generate_market_data(ticker: str, days: int = 30) -> List[MarketData]:
    data = []
    start_date = datetime.now() - timedelta(days=days)
    
    price = 150 if ticker == "AAPL" else 100
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Generate random price movement
        change = (random.random() - 0.5) * 5
        price += change
        
        open_price = price
        close_price = price + (random.random() - 0.5) * 3
        high_price = max(open_price, close_price) + random.random() * 2
        low_price = min(open_price, close_price) - random.random() * 2
        volume = int(random.random() * 1000000 + 500000)
        
        data.append(MarketData(
            date=date.strftime("%Y-%m-%d"),
            open=open_price,
            high=high_price,
            low=low_price,
            close=close_price,
            volume=volume
        ))
    
    return data

def generate_news_data(days: int = 30) -> List[NewsItem]:
    news_sources = ["Bloomberg", "CNBC", "Financial Times", "Wall Street Journal", "Reuters"]
    positive_titles = [
        "Tech Stocks Surge as AI Adoption Accelerates",
        "Market Rally Continues on Strong Earnings",
        "Economic Growth Exceeds Expectations",
        "Global Supply Chain Issues Begin to Ease",
        "Central Bank Signals Continued Support"
    ]
    negative_titles = [
        "Inflation Concerns Weigh on Markets",
        "Tech Selloff Deepens Amid Valuation Concerns",
        "Federal Reserve Signals Potential Rate Hike",
        "Retail Sales Decline for Second Consecutive Month",
        "Manufacturing Activity Slows Unexpectedly"
    ]
    neutral_titles = [
        "Markets Mixed Ahead of Earnings Season",
        "Oil Prices Stabilize Following Production Agreement",
        "Investors Await Key Economic Data",
        "Global Markets Show Muted Response to Policy Changes",
        "Trading Volume Below Average as Holiday Approaches"
    ]
    
    data = []
    start_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Generate random number of news items for each day
        news_count = random.randint(0, 3)
        
        for j in range(news_count):
            sentiment = random.random() * 2 - 1  # -1 to 1
            
            if sentiment > 0.3:
                title = random.choice(positive_titles)
            elif sentiment < -0.3:
                title = random.choice(negative_titles)
            else:
                title = random.choice(neutral_titles)
            
            data.append(NewsItem(
                id=len(data) + 1,
                title=title,
                source=random.choice(news_sources),
                date=date.strftime("%Y-%m-%d"),
                sentiment=sentiment,
                summary=f"This is a mock summary for the news item '{title}' on {date.strftime('%Y-%m-%d')}."
            ))
    
    return data

def generate_timeline_data(days: int = 30) -> List[TimelineData]:
    market_data = generate_market_data("GENERAL", days)
    news_data = generate_news_data(days)
    
    # Group news by date
    news_by_date = {}
    for news in news_data:
        if news.date not in news_by_date:
            news_by_date[news.date] = []
        news_by_date[news.date].append(news)
    
    timeline_data = []
    
    for market in market_data:
        date = market.date
        news_for_date = news_by_date.get(date, [])
        
        # Calculate average sentiment for the day
        sentiment = 0
        if news_for_date:
            sentiment = sum(news.sentiment for news in news_for_date) / len(news_for_date)
        
        timeline_data.append(TimelineData(
            date=date,
            price=market.close,
            volume=market.volume,
            sentiment=sentiment,
            newsCount=len(news_for_date),
            news=news_for_date[0] if news_for_date else None
        ))
    
    return timeline_data

# API Routes
@app.get("/")
def read_root():
    return {"message": "Welcome to the VIBE API"}

@app.get("/api/market/{ticker}", response_model=List[MarketData])
def get_market_data(ticker: str, days: int = Query(30, ge=1, le=365)):
    return generate_market_data(ticker, days)

@app.get("/api/news", response_model=List[NewsItem])
def get_news_data(days: int = Query(30, ge=1, le=365)):
    return generate_news_data(days)

@app.get("/api/timeline", response_model=List[TimelineData])
def get_timeline_data(days: int = Query(30, ge=1, le=365)):
    return generate_timeline_data(days)

@app.get("/api/news/{news_id}", response_model=NewsItem)
def get_news_item(news_id: int):
    # In a real app, this would fetch from a database
    news_data = generate_news_data(30)
    for news in news_data:
        if news.id == news_id:
            return news
    raise HTTPException(status_code=404, detail="News item not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
