# TinyLink - URL Shortener

A modern, production-ready URL shortener built with Next.js 14, PostgreSQL, and Tailwind CSS featuring glassmorphism design and dark mode support.

## ✨ Features

- 🔗 Create short links with custom or random codes
- 📊 Track click statistics in real-time
- 📈 View detailed analytics per link
- 🎨 Beautiful glassmorphism UI with dark mode
- 📱 Fully responsive design
- ⚡ Fast redirects with PostgreSQL
- 🔒 Input validation and error handling
- 🎯 TypeScript for type safety

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Hosting:** Vercel

## 🚀 Local Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/tinylink.git
cd tinylink
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up database:**
   - Create a free account at [Neon](https://neon.tech)
   - Create a new project
   - Run the SQL from `schema.sql` in Neon's SQL Editor

4. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL:
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/links` | Create a new short link |
| GET | `/api/links` | List all links |
| GET | `/api/links/:code` | Get link statistics |
| DELETE | `/api/links/:code` | Delete a link |
| GET | `/:code` | Redirect to original URL |
| GET | `/api/healthz` | Health check |

### Example: Create Link

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customCode":"mylink"}'
```

## 📁 Project Structure

```
tinylink/
├── src/
│   ├── app/
│   │   ├── [code]/          # Redirect handler
│   │   ├── api/
│   │   │   ├── healthz/     # Health check
│   │   │   └── links/       # Links API
│   │   ├── code/[code]/     # Stats page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── AmbientBackground.tsx
│   │   ├── Header.tsx
│   │   ├── LinkForm.tsx
│   │   ├── LinksTable.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── db.ts           # Database connection
│   │   └── utils.ts        # Helper functions
│   └── types/
│       └── index.ts        # TypeScript types
├── docs/                   # Documentation
├── schema.sql     # Database setup
└── .env.example           # Environment template
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `NEXT_PUBLIC_BASE_URL` (auto-set by Vercel)
5. Deploy!

### Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string from Neon
- `NEXT_PUBLIC_BASE_URL`: Your app's public URL
- `NODE_ENV`: Environment (development/production)

## 🧪 Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:3000/api/healthz

# Create link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"test"}'

# Get all links
curl http://localhost:3000/api/links

# Test redirect
curl -I http://localhost:3000/test

# Delete link
curl -X DELETE http://localhost:3000/api/links/test
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
