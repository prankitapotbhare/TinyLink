# TinyLink Development Guide

## Project Setup

### Create Next.js Project

```bash
# Create Next.js project with TypeScript and Tailwind CSS
npx create-next-app@latest tinylink

# When prompted, select:
# ✓ TypeScript? → Yes
# ✓ ESLint? → Yes
# ✓ Tailwind CSS? → Yes
# ✓ src/ directory? → Yes
# ✓ App Router? → Yes
# ✓ Customize default import alias? → No (@/ is default)

cd tinylink

# Install PostgreSQL client and types
npm install pg
npm install -D @types/pg
```

---

## Database Setup (Neon PostgreSQL)

### 1. Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (free tier)
3. Create new project: "tinylink"
4. Select region closest to you
5. Copy connection string from dashboard

### 2. Database Schema

Run this SQL in Neon's SQL Editor:

```sql
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
```

### 3. Environment Variables

Create `.env.local`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env.example`:
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database
NEXT_PUBLIC_BASE_URL=https://yourapp.vercel.app
NODE_ENV=production
```

**Important:** Add `.env.local` to `.gitignore` (should be there by default)

---

## Project Structure

```
tinylink/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── links/
│   │   │   │   ├── route.ts          # GET, POST /api/links
│   │   │   │   └── [code]/
│   │   │   │       └── route.ts      # GET, DELETE /api/links/:code
│   │   │   └── healthz/
│   │   │       └── route.ts          # GET /healthz
│   │   ├── code/
│   │   │   └── [code]/
│   │   │       └── page.tsx          # Stats page for /code/:code
│   │   ├── [code]/
│   │   │   └── route.ts              # Redirect handler GET /:code
│   │   ├── page.tsx                  # Dashboard (homepage)
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles with Tailwind
│   │   └── favicon.ico               # App icon
│   ├── components/
│   │   ├── LinkForm.tsx              # Form to create links
│   │   ├── LinksTable.tsx            # Table to display all links
│   │   ├── Header.tsx                # Navigation header with theme toggle
│   │   ├── ThemeProvider.tsx         # Theme context provider
│   │   ├── ThemeToggle.tsx           # Dark/light mode toggle button
│   │   └── AmbientBackground.tsx     # Animated background
│   ├── lib/
│   │   ├── db.ts                     # Database connection pool
│   │   └── utils.ts                  # Helper functions
│   └── types/
│       └── index.ts                  # TypeScript type definitions
├── database/
│   └── schema.sql                    # Database schema
├── docs/
│   ├── Context.md                    # Project requirements
│   ├── Development-Guide.md          # This file
│   └── Workflow.md                   # Implementation workflow
├── .env.local                        # Local environment variables
├── .env.example                      # Example environment variables
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json                     # TypeScript configuration
├── README.md
└── postcss.config.mjs                # PostCSS config for Tailwind
```

---

## Database Connection

### src/lib/db.ts

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

export default pool;
```

---

## Utility Functions

### src/lib/utils.ts

```typescript
export function generateRandomCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function validateCode(code: string): boolean {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}
```

### src/types/index.ts

```typescript
export interface Link {
  id: number;
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
}

export interface CreateLinkRequest {
  url: string;
  customCode?: string;
}

export interface CreateLinkResponse {
  code: string;
  url: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}
```

---

## API Routes

### 1. Health Check Endpoint

`app/api/healthz/route.js`

```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const startTime = Date.now();

export async function GET() {
  try {
    // Test database connection
    await pool.query('SELECT 1');

    return NextResponse.json({
      ok: true,
      version: '1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        ok: false,
        version: '1.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

### 2. Links API - GET & POST

`src/app/api/links/route.ts`

```typescript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateRandomCode, validateCode, validateUrl } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, customCode } = body;

    if (!url || !validateUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid URL' },
        { status: 400 }
      );
    }

    let code = customCode;
    
    if (code) {
      if (!validateCode(code)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }
    } else {
      // Generate random code
      code = generateRandomCode(6);
      
      // Check for collision (unlikely but possible)
      let attempts = 0;
      while (attempts < 5) {
        const existing = await pool.query(
          'SELECT code FROM links WHERE code = $1',
          [code]
        );
        if (existing.rows.length === 0) break;
        code = generateRandomCode(6);
        attempts++;
      }
    }

    // Insert into database
    const result = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [code, url]
    );

    const link = result.rows[0];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json(
      {
        code: link.code,
        url: link.url,
        shortUrl: `${baseUrl}/${link.code}`,
        clicks: link.clicks,
        createdAt: link.created_at
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate key constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );

    return NextResponse.json({ 
      links: result.rows 
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Single Link API - GET & DELETE

`src/app/api/links/[code]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    const result = await pool.query(
      'SELECT * FROM links WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    const result = await pool.query(
      'DELETE FROM links WHERE code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Link deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Redirect Handler

`src/app/[code]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Use transaction to ensure atomicity
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get the link
      const result = await client.query(
        'SELECT * FROM links WHERE code = $1',
        [code]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }

      const link = result.rows[0];

      // Update click count and last_clicked timestamp
      await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
        [code]
      );

      await client.query('COMMIT');

      // Perform 302 redirect
      return NextResponse.redirect(link.url, { status: 302 });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Styling Setup

### Tailwind Configuration

**Note:** This project uses Tailwind CSS v4 with the new `@import "tailwindcss"` syntax. Configuration is done via CSS custom properties in `globals.css` rather than a traditional config file.

### Global Styles

`src/app/globals.css` uses Tailwind CSS v4 with custom properties for theming:

```css
@import "tailwindcss";

:root {
  --background: #fafafa;
  --foreground: #171717;
  --border: #e5e5e5;
  --card: #ffffff;
  --card-hover: #f5f5f5;
  --accent: #0a0a0a;
  --accent-hover: #262626;
  --muted: #737373;
  --subtle: #a3a3a3;
  
  /* Gradient colors */
  --gradient-from: #6366f1;
  --gradient-via: #8b5cf6;
  --gradient-to: #d946ef;
  --gradient-subtle: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(217, 70, 239, 0.05) 100%);
  --gradient-accent: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --border: #262626;
  --card: #171717;
  --card-hover: #1c1c1c;
  --accent: #fafafa;
  --accent-hover: #e5e5e5;
  --muted: #a3a3a3;
  --subtle: #737373;
  
  /* Gradient colors - darker, more subtle */
  --gradient-from: #4f46e5;
  --gradient-via: #7c3aed;
  --gradient-to: #c026d3;
  --gradient-subtle: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(192, 38, 211, 0.08) 100%);
  --gradient-accent: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%);
}

body {
  background: var(--background);
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.03) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.03) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(217, 70, 239, 0.03) 0px, transparent 50%);
  color: var(--foreground);
  transition: color 200ms ease, background-color 200ms ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.011em;
}

.card {
  background: var(--card);
  background-image: var(--gradient-subtle);
  border: 1px solid var(--border);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03);
  transition: all 200ms ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: var(--background);
  border: 1px solid var(--accent);
  transition: all 150ms ease;
}

.input-field {
  background-color: var(--card);
  border: 1px solid var(--border);
  color: var(--foreground);
  transition: all 150ms ease;
}
```

---

## Frontend Components

### 1. Theme Provider

`src/components/ThemeProvider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({ 
  children, 
  attribute = 'class', 
  defaultTheme = 'system', 
  enableSystem = true 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, enableSystem]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### 2. Theme Toggle

`src/components/ThemeToggle.tsx`

```typescript
'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md border divider hover:bg-gradient-to-br hover:from-[rgba(99,102,241,0.1)] hover:to-[rgba(139,92,246,0.1)] dark:hover:from-[rgba(79,70,229,0.15)] dark:hover:to-[rgba(124,58,237,0.15)] hover:border-[var(--gradient-from)] transition-all hover:shadow-sm hover:scale-105 touch-manipulation"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 1V2.5M8 13.5V15M15 8H13.5M2.5 8H1M12.5 12.5L11.5 11.5M4.5 4.5L3.5 3.5M12.5 3.5L11.5 4.5M4.5 11.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 8.5C13.5 11.5 10.5 14 7 14C3.5 14 1 11.5 1 8C1 4.5 3.5 2 7 2C7.5 2 8 2 8.5 2.5C7 3 6 4.5 6 6.5C6 9 7.5 11 10 11C11.5 11 13 10 13.5 8.5C13.5 8.5 14 8.5 14 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}
```

### 3. Ambient Background

`src/components/AmbientBackground.tsx`

```typescript
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-blue-600/20 dark:mix-blend-normal"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-600/20 dark:mix-blend-normal"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600/10 dark:mix-blend-normal"></div>
    </div>
  );
}
```

### 4. Header Component

`src/components/Header.tsx`

```typescript
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <nav className="sticky top-2 sm:top-4 mx-2 sm:mx-4 md:mx-auto max-w-7xl z-50 glass-panel rounded-xl sm:rounded-2xl mt-2 sm:mt-4">
      <div className="px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">🔗</span>
            <span className="text-lg sm:text-xl font-bold tracking-tight truncate">TinyLink</span>
          </a>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <a 
              href="/api/healthz" 
              target="_blank"
              className="hidden sm:block text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Status
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 5. Root Layout

`src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import AmbientBackground from '@/components/AmbientBackground';
import Header from '@/components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TinyLink - URL Shortener',
  description: 'Shorten URLs and track click statistics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AmbientBackground />
          <div className="relative min-h-screen flex flex-col">
            <Header />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 6. Dashboard Page

`src/app/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import LinkForm from '@/components/LinkForm';
import LinksTable from '@/components/LinksTable';
import type { Link, CreateLinkResponse } from '@/types';

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/links');
      
      if (!res.ok) {
        throw new Error('Failed to fetch links');
      }
      
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      setError('Failed to load links. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleLinkCreated = (newLink: CreateLinkResponse) => {
    fetchLinks();
  };

  const handleLinkDeleted = (code: string) => {
    setLinks(links.filter(link => link.code !== code));
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-2 tracking-tight bg-gradient-to-r from-[var(--foreground)] via-[var(--gradient-from)] to-[var(--foreground)] bg-clip-text">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted">
          Create and manage your short links
        </p>
      </div>

      <LinkForm onLinkCreated={handleLinkCreated} />

      {error && (
        <div className="mt-6 p-4 card rounded-lg border-red-600 animate-fadeIn">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--border)] border-t-[var(--gradient-from)]"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] opacity-20 blur-md"></div>
          </div>
          <p className="mt-4 text-sm text-muted">Loading links...</p>
        </div>
      ) : (
        <LinksTable 
          links={links} 
          onLinkDeleted={handleLinkDeleted}
          onRefresh={fetchLinks}
        />
      )}
    </main>
  );
}
```

### 7. Stats Page

`app/code/[code]/page.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function StatsPage() {
  const params = useParams();
  const code = params.code;
  
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/links/${code}`);
        
        if (!res.ok) {
          throw new Error('Link not found');
        }
        
        const data = await res.json();
        setLink(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [code]);

  const handleCopy = () => {
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/"
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-6 inline-block"
      >
        ← Back to Dashboard
      </Link>

      <div className="glass-panel rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">
          Link Statistics
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Short URL</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 px-3 py-2 glass-subtle rounded border text-blue-600 dark:text-blue-400">
                {shortUrl}
              </code>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Original URL</label>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 px-3 py-2 glass-subtle rounded border text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-all"
            >
              {link.url}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {link.clicks}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Clicks</div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <div className="text-lg font-semibold mb-2">
            {formatDate(link.created_at)}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Created</div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <div className="text-lg font-semibold mb-2">
            {formatDate(link.last_clicked)}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Last Clicked</div>
        </div>
      </div>
    </main>
  );
}
```

---

## Testing

### Manual Testing with curl

```bash
# 1. Health check
curl http://localhost:3000/api/healthz

# 2. Create link with custom code
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"google"}'

# 3. Create link without custom code
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# 4. Get all links
curl http://localhost:3000/api/links

# 5. Get specific link
curl http://localhost:3000/api/links/google

# 6. Test redirect
curl -I http://localhost:3000/google

# 7. Delete link
curl -X DELETE http://localhost:3000/api/links/google

# 8. Verify 404 after deletion
curl http://localhost:3000/google
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/manishborikar92/tinylink.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Framework will auto-detect as Next.js
6. Add environment variables:
   - `DATABASE_URL` = Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL` = Will be auto-set by Vercel
7. Click "Deploy"

### 3. Post-Deployment

1. Wait for deployment to complete
2. Test health check: `https://your-app.vercel.app/api/healthz`
3. Test creating links
4. Update `NEXT_PUBLIC_BASE_URL` if needed

---

## Common Issues & Solutions

### Database Connection Fails
- Verify `DATABASE_URL` in `.env.local`
- Check SSL mode: `?sslmode=require`
- Test with: `psql $DATABASE_URL`

### Redirects Not Working
- Check route file location: `app/[code]/route.js`
- Verify database query returns data
- Check for errors in browser console

### Environment Variables Not Working
- Prefix client-side vars with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`
- Redeploy on Vercel after updating env vars

### Duplicate Code Errors
- Check unique constraint in database
- Verify error handling for code 23505
- Test collision retry logic