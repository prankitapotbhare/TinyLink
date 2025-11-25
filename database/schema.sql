-- TinyLink Database Schema
-- Run this in your Neon PostgreSQL SQL Editor

-- Create links table
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_code ON links(code);
CREATE INDEX idx_created_at ON links(created_at DESC);
