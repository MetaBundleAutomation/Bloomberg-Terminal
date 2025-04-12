from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import random
import hashlib
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
    
    # Seed for pseudo-random but consistent data for each symbol
    symbol_seed = sum(ord(char) for char in ticker)
    
    price = 150 if ticker == "AAPL" else 100 + (symbol_seed % 200)
    trend = (symbol_seed % 10) / 10  # Different trend direction based on symbol
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Generate price movement influenced by the symbol and day
        day_influence = (i * (symbol_seed % 5) / 10)
        random_factor = random.random() * 10 - 5
        price_change = (random_factor + day_influence + trend) * (1 + (symbol_seed % 5) / 10)
        
        price += price_change
        price = max(50, price)  # Ensure price doesn't go too low
        
        open_price = price
        close_price = price + (random.random() - 0.5) * 3
        high_price = max(open_price, close_price) + random.random() * 2
        low_price = min(open_price, close_price) - random.random() * 2
        volume = int(random.random() * 1000000 * (1 + (symbol_seed % 3) / 5) + 500000)
        
        data.append(MarketData(
            date=date.strftime("%Y-%m-%d"),
            open=open_price,
            high=high_price,
            low=low_price,
            close=close_price,
            volume=volume
        ))
    
    return data

def generate_news_data(ticker: str = "GENERAL", days: int = 30) -> List[NewsItem]:
    # Use a deterministic seed for consistent news generation
    random.seed(42 + sum(ord(char) for char in ticker))
    
    # Seed for pseudo-random but consistent data for each symbol
    symbol_seed = sum(ord(char) for char in ticker)
    
    news_sources = ["Bloomberg", "CNBC", "Financial Times", "Wall Street Journal", "Reuters"]
    
    # Generate news titles based on the symbol
    symbol_name = ticker if ticker != "GENERAL" else "Markets"
    
    positive_titles = [
        f"{symbol_name} Surges on Strong Earnings Report",
        f"Analysts Upgrade {symbol_name} Following Product Announcement",
        f"{symbol_name} Gains as Sector Shows Growth",
        f"New Partnership Boosts {symbol_name} Shares",
        f"Central Bank Signals Continued Support"
    ]
    
    negative_titles = [
        f"{symbol_name} Drops After Missing Quarterly Expectations",
        f"Regulatory Concerns Weigh on {symbol_name}",
        f"{symbol_name} Falls as Competitors Gain Market Share",
        "Federal Reserve Signals Potential Rate Hike",
        "Retail Sales Decline for Second Consecutive Month"
    ]
    
    neutral_titles = [
        f"{symbol_name} Holds Steady Ahead of Earnings",
        f"Analysts Maintain Neutral Stance on {symbol_name}",
        f"{symbol_name} Shows Mixed Signals in Volatile Market",
        "Markets Mixed Ahead of Earnings Season",
        "Oil Prices Stabilize Following Production Agreement"
    ]
    
    # General market news that might affect any symbol
    market_titles = [
        "Federal Reserve Signals Potential Rate Hike",
        "Inflation Concerns Weigh on Markets",
        "Global Supply Chain Issues Begin to Ease",
        "Economic Growth Exceeds Expectations",
        "Market Volatility Increases Amid Geopolitical Tensions"
    ]
    
    data = []
    start_date = datetime.now() - timedelta(days=days)
    
    # Generate a fixed number of news items per day for consistency
    news_per_day = {}
    
    # First, determine how many news items per day (0-3)
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Use a hash of the date and ticker to get a consistent number of news items
        hash_input = f"{date_str}_{ticker}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        news_count = hash_value % 4  # 0-3 news items per day
        
        news_per_day[date_str] = news_count
    
    # Now generate the news items
    news_id = 1
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        for j in range(news_per_day[date_str]):
            # Use a hash of the date, ticker, and news index to get consistent sentiment
            hash_input = f"{date_str}_{ticker}_{j}"
            hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
            sentiment_base = (hash_value % 100) / 100.0  # 0.0 to 0.99
            sentiment = (sentiment_base * 2 - 1)  # -1 to 1
            
            # Select news title based on sentiment and hash
            is_symbol_specific = (hash_value % 100) > 30  # 70% symbol-specific news
            
            if not is_symbol_specific:
                title = market_titles[hash_value % len(market_titles)]
            elif sentiment > 0.3:
                title = positive_titles[hash_value % len(positive_titles)]
            elif sentiment < -0.3:
                title = negative_titles[hash_value % len(negative_titles)]
            else:
                title = neutral_titles[hash_value % len(neutral_titles)]
            
            source = news_sources[hash_value % len(news_sources)]
            
            data.append(NewsItem(
                id=news_id,
                title=title,
                source=source,
                date=date_str,
                sentiment=sentiment,
                summary=f"This is a mock summary for the news item '{title}' on {date_str}."
            ))
            news_id += 1
    
    # Reset the random seed
    random.seed()
    
    # Sort by date (newest first)
    return sorted(data, key=lambda x: x.date, reverse=True)

def generate_timeline_data(ticker: str = "GENERAL", days: int = 30) -> List[TimelineData]:
    market_data = generate_market_data(ticker, days)
    news_data = generate_news_data(ticker, days)
    
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
def get_news_data(symbol: str = "GENERAL", days: int = Query(30, ge=1, le=365)):
    return generate_news_data(symbol, days)

@app.get("/api/timeline", response_model=List[TimelineData])
def get_timeline_data(symbol: str = "GENERAL", days: int = Query(30, ge=1, le=365)):
    return generate_timeline_data(symbol, days)

@app.get("/api/news/{news_id}", response_model=NewsItem)
def get_news_item(news_id: int, symbol: str = "GENERAL"):
    # In a real app, this would fetch from a database
    news_data = generate_news_data(symbol, 30)
    for news in news_data:
        if news.id == news_id:
            return news
    raise HTTPException(status_code=404, detail="News item not found")

if __name__ == "__main__":
    import uvicorn
    import argparse
    
    parser = argparse.ArgumentParser(description="Run the VIBE API server")
    parser.add_argument("--port", type=int, default=8001, help="Port to run the server on")
    args = parser.parse_args()
    
    uvicorn.run(app, host="0.0.0.0", port=args.port)
