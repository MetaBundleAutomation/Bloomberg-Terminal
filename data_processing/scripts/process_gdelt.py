#!/usr/bin/env python3
"""
GDELT Data Processing Script

This script downloads and processes GDELT data, extracts relevant news articles,
performs sentiment analysis, and stores the results in a database.
"""

import os
import sys
import argparse
import logging
import pandas as pd
import numpy as np
import requests
import zipfile
import io
from datetime import datetime, timedelta
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Constants
GDELT_BASE_URL = "http://data.gdeltproject.org/gdeltv2/"
GDELT_MASTER_URL = "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt"
DB_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/bloomberg")

# SQLAlchemy setup
Base = declarative_base()

class NewsArticle(Base):
    __tablename__ = 'news_articles'
    
    id = Column(Integer, primary_key=True)
    gdelt_id = Column(String, unique=True, index=True)
    date = Column(Date, index=True)
    title = Column(String)
    source = Column(String)
    url = Column(String)
    sentiment = Column(Float)
    summary = Column(Text)
    
    def __repr__(self):
        return f"<NewsArticle(id={self.id}, date='{self.date}', title='{self.title}')>"

def create_db_engine():
    """Create SQLAlchemy engine and tables"""
    engine = create_engine(DB_URL)
    Base.metadata.create_all(engine)
    return engine

def download_gdelt_file(url):
    """Download a GDELT CSV file from the given URL"""
    logger.info(f"Downloading GDELT file from {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # GDELT files are zipped
        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            # Extract the CSV file (there should be only one)
            csv_filename = z.namelist()[0]
            with z.open(csv_filename) as f:
                df = pd.read_csv(
                    f, 
                    sep='\t', 
                    header=None,
                    dtype=str
                )
                return df
    except Exception as e:
        logger.error(f"Error downloading GDELT file: {e}")
        return None

def get_gdelt_files_for_date_range(start_date, end_date):
    """Get list of GDELT files for a given date range"""
    logger.info(f"Getting GDELT files from {start_date} to {end_date}")
    try:
        response = requests.get(GDELT_MASTER_URL)
        response.raise_for_status()
        
        files = []
        for line in response.text.splitlines():
            if not line.strip():
                continue
                
            parts = line.split()
            if len(parts) < 3:
                continue
                
            url = parts[2]
            if not url.endswith('.export.CSV.zip'):
                continue
                
            # Extract date from filename
            filename = url.split('/')[-1]
            date_str = filename.split('.')[0]
            
            try:
                file_date = datetime.strptime(date_str, '%Y%m%d%H%M%S')
                if start_date <= file_date <= end_date:
                    files.append(url)
            except ValueError:
                continue
        
        return files
    except Exception as e:
        logger.error(f"Error getting GDELT file list: {e}")
        return []

def parse_gdelt_data(df):
    """Parse GDELT data and extract relevant fields"""
    if df is None or df.empty:
        return pd.DataFrame()
    
    # GDELT columns based on schema: http://data.gdeltproject.org/documentation/GDELT-Event_Codebook-V2.0.pdf
    # We're primarily interested in news metadata
    try:
        # Rename columns based on GDELT schema
        columns = [
            'GLOBALEVENTID', 'SQLDATE', 'MonthYear', 'Year', 'FractionDate',
            'Actor1Code', 'Actor1Name', 'Actor1CountryCode', 'Actor1KnownGroupCode',
            'Actor1EthnicCode', 'Actor1Religion1Code', 'Actor1Religion2Code',
            'Actor1Type1Code', 'Actor1Type2Code', 'Actor1Type3Code',
            'Actor2Code', 'Actor2Name', 'Actor2CountryCode', 'Actor2KnownGroupCode',
            'Actor2EthnicCode', 'Actor2Religion1Code', 'Actor2Religion2Code',
            'Actor2Type1Code', 'Actor2Type2Code', 'Actor2Type3Code',
            'IsRootEvent', 'EventCode', 'EventBaseCode', 'EventRootCode',
            'QuadClass', 'GoldsteinScale', 'NumMentions', 'NumSources', 'NumArticles',
            'AvgTone', 'Actor1Geo_Type', 'Actor1Geo_FullName', 'Actor1Geo_CountryCode',
            'Actor1Geo_ADM1Code', 'Actor1Geo_ADM2Code', 'Actor1Geo_Lat', 'Actor1Geo_Long',
            'Actor1Geo_FeatureID', 'Actor2Geo_Type', 'Actor2Geo_FullName',
            'Actor2Geo_CountryCode', 'Actor2Geo_ADM1Code', 'Actor2Geo_ADM2Code',
            'Actor2Geo_Lat', 'Actor2Geo_Long', 'Actor2Geo_FeatureID', 'ActionGeo_Type',
            'ActionGeo_FullName', 'ActionGeo_CountryCode', 'ActionGeo_ADM1Code',
            'ActionGeo_ADM2Code', 'ActionGeo_Lat', 'ActionGeo_Long', 'ActionGeo_FeatureID',
            'DATEADDED', 'SOURCEURL'
        ]
        
        # Ensure df has enough columns
        if len(df.columns) >= len(columns):
            df.columns = columns + [f'EXTRA_{i}' for i in range(len(df.columns) - len(columns))]
        else:
            # If there are fewer columns than expected, use what we have
            df.columns = columns[:len(df.columns)]
        
        # Extract relevant fields
        result_df = pd.DataFrame({
            'gdelt_id': df['GLOBALEVENTID'],
            'date': pd.to_datetime(df['SQLDATE'], format='%Y%m%d'),
            'source': df['Actor1Name'].fillna('Unknown'),
            'url': df['SOURCEURL'],
            'tone': df['AvgTone'].astype(float) / 100.0  # Normalize to -1 to 1 range
        })
        
        # Filter out rows with missing URLs
        result_df = result_df[result_df['url'].notna()]
        
        return result_df
    except Exception as e:
        logger.error(f"Error parsing GDELT data: {e}")
        return pd.DataFrame()

def perform_sentiment_analysis(text):
    """Perform sentiment analysis on text using VADER"""
    analyzer = SentimentIntensityAnalyzer()
    sentiment = analyzer.polarity_scores(text)
    return sentiment['compound']  # Compound score is between -1 and 1

def extract_title_from_url(url):
    """Extract a title from a URL (mock function)"""
    # In a real implementation, this would fetch the article and extract the title
    # For this demo, we'll generate a mock title
    parts = url.split('/')
    domain = parts[2] if len(parts) > 2 else 'unknown'
    return f"Article from {domain}"

def process_gdelt_files(file_urls, engine):
    """Process GDELT files and store results in database"""
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        for url in file_urls:
            df = download_gdelt_file(url)
            if df is None or df.empty:
                continue
                
            parsed_df = parse_gdelt_data(df)
            if parsed_df.empty:
                continue
                
            logger.info(f"Processing {len(parsed_df)} articles from {url}")
            
            for _, row in parsed_df.iterrows():
                # Check if article already exists
                existing = session.query(NewsArticle).filter_by(gdelt_id=row['gdelt_id']).first()
                if existing:
                    continue
                
                # Extract title (mock)
                title = extract_title_from_url(row['url'])
                
                # Use tone as sentiment or perform our own analysis
                sentiment = row['tone']
                
                # Create a mock summary
                summary = f"This is a mock summary for the article with ID {row['gdelt_id']}."
                
                # Create news article record
                article = NewsArticle(
                    gdelt_id=row['gdelt_id'],
                    date=row['date'],
                    title=title,
                    source=row['source'],
                    url=row['url'],
                    sentiment=sentiment,
                    summary=summary
                )
                
                session.add(article)
            
            session.commit()
            logger.info(f"Processed file {url}")
    except Exception as e:
        logger.error(f"Error processing GDELT files: {e}")
        session.rollback()
    finally:
        session.close()

def main():
    parser = argparse.ArgumentParser(description='Process GDELT data for market sentiment analysis')
    parser.add_argument('--days', type=int, default=7, help='Number of days to process')
    args = parser.parse_args()
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=args.days)
    
    logger.info(f"Processing GDELT data from {start_date} to {end_date}")
    
    # Create database engine and tables
    engine = create_db_engine()
    
    # Get GDELT files for date range
    file_urls = get_gdelt_files_for_date_range(start_date, end_date)
    logger.info(f"Found {len(file_urls)} GDELT files to process")
    
    # Process files
    process_gdelt_files(file_urls, engine)
    
    logger.info("GDELT processing complete")

if __name__ == "__main__":
    main()
