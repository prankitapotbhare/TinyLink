# TinyLink Project Context & Requirements

## Overview
Build a URL shortener web application similar to bit.ly that allows users to shorten URLs, view click statistics, and manage links.

**Estimated Time:** 2 days  
**Submission Requirements:**
1. Public URL for testing
2. GitHub repository URL
3. Video walkthrough explaining solution and code
4. Link to ChatGPT/LLM transcript (if used)

---

## Technology Stack

### Framework
- **Next.js 14+** (Full-stack with App Router)

### Styling
- **Tailwind CSS** (Utility-first CSS framework)
- **Glassmorphism Design** (Premium frosted glass aesthetic)
- **Dark Mode Support** (System-aware theme switching)

### Database
- **PostgreSQL** via **Neon** (Free tier, serverless)
  - Sign up at: https://neon.tech
  - Free tier includes: 0.5 GB storage, 1 project

### Hosting
- **Vercel** (Free tier, optimal for Next.js)
  - Automatic deployments from GitHub
  - Environment variable management
  - Built-in analytics

---

## Core Features

### 1. Create Short Links
- Accept long URL input
- Accept optional custom short code (6-8 characters)
- Validate URL format before saving
- Generate random code if custom code not provided
- Custom codes are globally unique
- Return 409 error if code already exists

**Code Format:** `[A-Za-z0-9]{6,8}`

### 2. Redirect Functionality
- `GET /{code}` performs HTTP 302 redirect to original URL
- Increment total click count on each redirect
- Update "last clicked" timestamp
- Return 404 if code doesn't exist

### 3. Delete Links
- Users can delete existing links
- After deletion, `/{code}` returns 404
- Redirect no longer works

### 4. View Statistics
- Dashboard shows all links with stats
- Individual stats page for each link
- Track: clicks, last clicked time, creation date

---

## Pages & Routes

| Purpose | Path | Auth | Method |
|---------|------|------|--------|
| Dashboard | `/` | Public | GET |
| Stats for single link | `/code/:code` | Public | GET |
| Redirect | `/:code` | Public | GET |
| Health check | `/healthz` | Public | GET |

---

## API Endpoints (RESTful)

| Method | Path | Purpose | Success | Error |
|--------|------|---------|---------|-------|
| POST | `/api/links` | Create link | 201 | 409 (duplicate), 400 (invalid) |
| GET | `/api/links` | List all links | 200 | - |
| GET | `/api/links/:code` | Get stats for one code | 200 | 404 |
| DELETE | `/api/links/:code` | Delete link | 200 | 404 |

### POST /api/links
**Request Body:**
```json
{
  "url": "https://example.com/very/long/url",
  "customCode": "docs" // optional
}
```

**Response (201):**
```json
{
  "code": "docs",
  "url": "https://example.com/very/long/url",
  "shortUrl": "https://yourapp.vercel.app/docs",
  "clicks": 0,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

**Response (409):**
```json
{
  "error": "Code already exists"
}
```

### GET /api/links
**Response (200):**
```json
{
  "links": [
    {
      "code": "docs",
      "url": "https://example.com/very/long/url",
      "clicks": 42,
      "lastClicked": "2025-01-20T15:45:00Z",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/links/:code
**Response (200):**
```json
{
  "code": "docs",
  "url": "https://example.com/very/long/url",
  "clicks": 42,
  "lastClicked": "2025-01-20T15:45:00Z",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### DELETE /api/links/:code
**Response (200):**
```json
{
  "message": "Link deleted successfully"
}
```

### GET /healthz
**Response (200):**
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": 3600,
  "timestamp": "2025-01-20T16:00:00Z"
}
```

---

## Database Schema

### Table: `links`

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| code | VARCHAR(8) | UNIQUE, NOT NULL |
| url | TEXT | NOT NULL |
| clicks | INTEGER | DEFAULT 0 |
| last_clicked | TIMESTAMP | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

**SQL:**
```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_code ON links(code);
CREATE INDEX idx_created_at ON links(created_at DESC);
```

---

## UI/UX Requirements

### Layout & Hierarchy
- Premium frosted glass aesthetic (glassmorphism)
- Zinc color palette for neutral, professional look
- Ambient gradient backgrounds with animated blobs
- Dark mode support with system detection
- Clear structure with proper spacing
- Readable typography with high contrast
- Sensible information hierarchy
- Shared header with theme toggle

### States to Handle
1. **Empty State:** No links created yet
2. **Loading State:** Fetching data, submitting forms
3. **Success State:** Link created, deleted successfully
4. **Error State:** Validation errors, duplicate codes, network errors

### Form UX
- Inline validation for URL format
- Friendly error messages
- Disable submit button during loading
- Show loading spinner/indicator
- Visible confirmation on success
- Clear error messages

### Tables
- Sortable columns (code, clicks, date)
- Filterable by code or URL
- Truncate long URLs with ellipsis
- Functional copy buttons for short URLs
- Show "No results" for empty/filtered state

### Responsiveness
- Mobile-first approach
- Adapt layout for screens < 640px
- Stack form fields vertically on mobile
- Horizontal scroll for tables if needed
- Touch-friendly buttons (min 44px)

### Polish
- Glass panel components with backdrop blur
- Consistent button styles with transitions
- Uniform spacing and margins
- Zinc-based professional color scheme
- Animated gradient backgrounds
- Loading indicators
- Hover states for interactive elements
- Focus states for accessibility
- Smooth theme transitions
- Dark mode optimized colors

---

## Validation Rules

### URL Validation
- Must be valid HTTP/HTTPS URL
- Use URL constructor or regex validation
- Show error: "Please enter a valid URL"

### Custom Code Validation
- Pattern: `[A-Za-z0-9]{6,8}`
- Length: 6-8 characters
- Alphanumeric only
- Case-sensitive
- Show error: "Code must be 6-8 alphanumeric characters"

### Random Code Generation
- When no custom code provided
- Generate 6-character random code
- Check for uniqueness in database
- Retry if collision (unlikely)

---

## Error Handling

### HTTP Status Codes
- **200:** Success
- **201:** Resource created
- **400:** Bad request (validation error)
- **404:** Resource not found
- **409:** Conflict (duplicate code)
- **500:** Server error

### User-Facing Messages
- ✅ "Link created successfully!"
- ❌ "This code is already taken. Try another."
- ❌ "Please enter a valid URL"
- ❌ "Code must be 6-8 alphanumeric characters"
- ❌ "Link not found"
- ❌ "Something went wrong. Please try again."

---

## Testing Requirements

### Critical Tests
1. ✓ `/healthz` returns 200
2. ✓ Creating a link works
3. ✓ Duplicate codes return 409
4. ✓ Redirect works (302)
5. ✓ Redirect increments click count
6. ✓ Deletion stops redirect (404)
7. ✓ API endpoints follow spec
8. ✓ Code format validation

### Manual Review
- UI/UX quality
- Code organization
- Error handling
- Responsive design
- Form validation
- Loading states

---

## Environment Variables

Create `.env.local`:
```
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env.example`:
```
DATABASE_URL=postgresql://user:password@host.neon.tech/database
NEXT_PUBLIC_BASE_URL=https://yourapp.vercel.app
NODE_ENV=production
```

---

## Deployment Checklist

- [ ] Database schema created on Neon
- [ ] Environment variables configured in Vercel
- [ ] Health check endpoint working
- [ ] All API endpoints tested
- [ ] Redirects working with click tracking
- [ ] Error handling implemented
- [ ] UI responsive on mobile
- [ ] Forms validated
- [ ] Loading states shown
- [ ] GitHub repository public
- [ ] README with setup instructions
- [ ] Video walkthrough recorded

---

## Extra Credit Opportunities

- Clean, meaningful Git commits
- Modular, well-organized code
- Comprehensive error handling
- TypeScript usage
- Premium glassmorphism UI with dark mode
- Animated ambient backgrounds
- Theme persistence
- Rate limiting for API
- Analytics dashboard with charts
- QR code generation for links
- Link expiration feature
- Export links as CSV