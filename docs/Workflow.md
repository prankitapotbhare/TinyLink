# TinyLink Workflow & Implementation Steps

## Phase 1: Setup & Planning (2-3 hours)

### Step 1.1: Environment Setup

```bash
# Create Next.js project with App Router and Tailwind
npx create-next-app@latest tinylink

# When prompted:
# ✓ TypeScript? → Yes (recommended)
# ✓ ESLint? → Yes  
# ✓ Tailwind CSS? → Yes
# ✓ src/ directory? → No
# ✓ App Router? → Yes
# ✓ Customize import alias? → No

cd tinylink

# Install PostgreSQL client
npm install pg

# Initialize Git (if not already done)
git init
```

**Checklist:**
- [ ] Next.js project created
- [ ] Tailwind CSS configured
- [ ] Git repository initialized
- [ ] `.gitignore` includes `.env*.local`
- [ ] PostgreSQL package installed

### Step 1.2: Database Setup (Neon)

1. **Create Neon Account:**
   - Visit https://neon.tech
   - Sign up with GitHub (free tier)
   - Create new project: "tinylink"
   - Select closest region
   - Copy connection string

2. **Create Database Schema:**
   
   In Neon SQL Editor, run:
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

3. **Configure Environment:**
   
   Create `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NODE_ENV=development
   ```
   
   Create `.env.example`:
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/database
   NEXT_PUBLIC_BASE_URL=https://yourapp.vercel.app
   NODE_ENV=production
   ```

**Checklist:**
- [ ] Neon account created
- [ ] Database project created
- [ ] Schema applied successfully
- [ ] Connection string copied
- [ ] `.env.local` configured
- [ ] `.env.example` created

### Step 1.3: Project Structure

Create the folder structure:

```bash
mkdir -p lib components app/api/links/[code] app/api/healthz app/code/[code] app/[code]
```

Your structure should look like:
```
tinylink/
├── app/
│   ├── api/
│   │   ├── links/
│   │   │   ├── route.js
│   │   │   └── [code]/
│   │   │       └── route.js
│   │   └── healthz/
│   │       └── route.js
│   ├── code/
│   │   └── [code]/
│   │       └── page.js
│   ├── [code]/
│   │   └── route.js
│   ├── page.js
│   ├── layout.js
│   └── globals.css
├── components/
│   ├── LinkForm.js
│   ├── LinksTable.js
│   ├── Header.js
│   ├── ThemeProvider.js
│   ├── ThemeToggle.js
│   └── AmbientBackground.js
├── lib/
│   ├── db.js
│   └── utils.js
└── public/
```

**Checklist:**
- [ ] Folders created
- [ ] Structure matches Next.js App Router conventions
- [ ] Ready for implementation

---

## Phase 2: Backend Implementation (4-5 hours)

### Step 2.1: Database Connection

Create `lib/db.js`:
```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✓ Connected to database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(-1);
});

export default pool;
```

**Test Connection:**

Create a test file `test-db.js`:
```javascript
import pool from './lib/db.js';

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  }
})();
```

Run: `node test-db.js`

**Checklist:**
- [ ] Database connection file created
- [ ] Connection pool configured
- [ ] Test connection successful
- [ ] Error handling added

### Step 2.2: Utility Functions

Create `lib/utils.js`:
```javascript
export function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function validateCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

export function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function truncateUrl(url, maxLength = 50) {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

export function formatDate(dateString) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}
```

**Test Utilities:**
```javascript
// In browser console or Node
console.log(generateRandomCode()); // "aB3xY9"
console.log(validateCode("abc123")); // true
console.log(validateCode("ab")); // false (too short)
console.log(validateUrl("https://example.com")); // true
console.log(validateUrl("not-a-url")); // false
```

**Checklist:**
- [ ] All utility functions created
- [ ] Code generation works
- [ ] Validation functions tested
- [ ] Edge cases handled

### Step 2.3: Health Check Endpoint

Create `app/api/healthz/route.js`:
```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const startTime = Date.now();

export async function GET() {
  try {
    await pool.query('SELECT 1');
    return NextResponse.json({
      ok: true,
      version: '1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, database: 'disconnected', error: error.message },
      { status: 500 }
    );
  }
}
```

**Test:**
1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/api/healthz
3. Should return: `{"ok":true,"version":"1.0",...}`

**Checklist:**
- [ ] Endpoint returns 200 status
- [ ] Database connectivity checked
- [ ] Uptime tracked
- [ ] Error handling works

### Step 2.4: Create & List Links API

Create `app/api/links/route.js`:

**Implementation includes:**
- POST handler for creating links
- GET handler for listing all links
- URL validation
- Custom code validation
- Random code generation with collision handling
- Duplicate code error (409)
- Proper error messages

**Test POST:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"google"}'
```

**Test GET:**
```bash
curl http://localhost:3000/api/links
```

**Checklist:**
- [ ] POST creates link successfully
- [ ] Returns 201 with correct response format
- [ ] URL validation works
- [ ] Custom code validation works
- [ ] Random code generation works
- [ ] Duplicate code returns 409
- [ ] GET lists all links
- [ ] Links ordered by created_at DESC

### Step 2.5: Single Link Operations

Create `app/api/links/[code]/route.js`:

**Implementation includes:**
- GET handler for fetching single link
- DELETE handler for removing link
- 404 for non-existent codes
- Proper error handling

**Test GET:**
```bash
curl http://localhost:3000/api/links/google
```

**Test DELETE:**
```bash
curl -X DELETE http://localhost:3000/api/links/google
```

**Checklist:**
- [ ] GET returns link data
- [ ] DELETE removes link
- [ ] Both return 404 for missing codes
- [ ] Success messages formatted correctly

### Step 2.6: Redirect Handler

Create `app/[code]/route.js`:

**Implementation includes:**
- 302 redirect to original URL
- Atomic transaction for click tracking
- Increment clicks counter
- Update last_clicked timestamp
- 404 for missing codes
- Race condition handling

**Test:**
```bash
# Test redirect
curl -I http://localhost:3000/google

# Check click count increased
curl http://localhost:3000/api/links/google
```

**Checklist:**
- [ ] Redirect (302) works correctly
- [ ] Click count increments
- [ ] last_clicked updates
- [ ] Transaction ensures atomicity
- [ ] 404 for non-existent codes
- [ ] No race conditions

---

## Phase 3: Frontend Implementation (5-6 hours)

### Step 3.1: Root Layout

Update `app/layout.js`:

**Features:**
- Theme provider wrapper
- Ambient background component
- Header component integration
- Consistent styling
- Proper metadata
- Dark mode support

**Checklist:**
- [ ] ThemeProvider wraps app
- [ ] AmbientBackground included
- [ ] Header component rendered
- [ ] Metadata configured
- [ ] suppressHydrationWarning added
- [ ] Tailwind applied
- [ ] Mobile responsive
- [ ] Dark mode works

### Step 3.2: Theme Components

Create theme support components first:

**`components/ThemeProvider.js`:**
- [ ] Context for theme state
- [ ] System theme detection
- [ ] Dark/light mode switching
- [ ] Persist theme preference

**`components/ThemeToggle.js`:**
- [ ] Toggle button with icons
- [ ] Glass styling
- [ ] Smooth transitions

**`components/AmbientBackground.js`:**
- [ ] Animated gradient blobs
- [ ] Fixed positioning
- [ ] Blur effects
- [ ] Dark mode variants

**`components/Header.js`:**
- [ ] Glass panel navigation
- [ ] Logo and branding
- [ ] Theme toggle integration
- [ ] Status link

### Step 3.3: Link Form Component

Create `components/LinkForm.js`:

**Features to implement:**
- URL input field (required)
- Custom code input (optional)
- Client-side validation
- Loading state during submission
- Success message display
- Error message display
- Form reset after success
- Disabled state while loading
- Glass panel styling

**States:**
- `url` - URL input value
- `customCode` - Custom code value
- `loading` - Submission in progress
- `error` - Error message
- `success` - Success message

**Checklist:**
- [ ] Form renders with glass styling
- [ ] URL validation works
- [ ] Custom code validation works
- [ ] Loading state shows spinner
- [ ] Success message displays
- [ ] Error messages clear
- [ ] Form resets after success
- [ ] Callback triggers on success
- [ ] Dark mode support

### Step 3.4: Links Table Component

Create `components/LinksTable.js`:

**Features to implement:**
- Display all links in table
- Columns: Code, URL, Clicks, Created, Last Clicked, Actions
- Copy button for short URL
- Delete button with confirmation
- Sort by columns
- Search/filter
- Empty state
- Loading state
- Mobile responsive (stacked or scrollable)
- Glass panel wrapper
- Zinc color scheme

**Checklist:**
- [ ] Table renders with glass styling
- [ ] Copy button works
- [ ] Copy feedback (tooltip/notification)
- [ ] Delete confirms before removing
- [ ] Delete updates parent state
- [ ] Empty state shows when no links
- [ ] Long URLs truncated
- [ ] Mobile layout works
- [ ] All dates formatted properly
- [ ] Dark mode support

### Step 3.5: Dashboard Page

Update `app/page.js`:

**Features:**
- Fetch links on mount
- Display LinkForm
- Display LinksTable
- Handle loading state
- Handle error state
- Refresh after create/delete

**Checklist:**
- [ ] Page loads without errors
- [ ] Links fetch automatically
- [ ] Loading spinner shows
- [ ] Error message displays on failure
- [ ] LinkForm callback works
- [ ] LinksTable delete callback works
- [ ] UI updates properly
- [ ] Mobile responsive

### Step 3.6: Stats Page

Create `app/code/[code]/page.js`:

**Features:**
- Fetch single link stats
- Display short URL with copy button
- Display original URL
- Display total clicks
- Display created date
- Display last clicked date
- Back to dashboard link
- Loading state
- 404 error state

**Checklist:**
- [ ] Stats page accessible
- [ ] All data displays correctly
- [ ] Copy button works
- [ ] Back link navigates to dashboard
- [ ] Loading state shows
- [ ] 404 handles missing codes
- [ ] Mobile responsive
- [ ] URLs formatted properly

---

## Phase 4: Styling & UX Polish (2-3 hours)

### Step 4.1: Tailwind Customization

Update `tailwind.config.js` for glassmorphism theme:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        glass: {
          border: "var(--glass-border)",
          surface: "var(--glass-surface)",
        }
      },
      animation: {
        'blob': 'blob 10s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
```

Update `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: #f4f4f5;
    --foreground: #18181b;
    --glass-border: rgba(255, 255, 255, 0.5);
    --glass-surface: rgba(255, 255, 255, 0.7);
  }

  .dark {
    --background: #09090b;
    --foreground: #f4f4f5;
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-surface: rgba(24, 24, 27, 0.6);
  }
}

@layer utilities {
  .glass-panel {
    @apply backdrop-blur-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] shadow-lg;
  }
  
  .glass-subtle {
    @apply backdrop-blur-md bg-[var(--glass-surface)]/50 border border-[var(--glass-border)]/50;
  }
}

body {
  @apply bg-background text-foreground transition-colors duration-300 antialiased;
}
```

### Step 4.2: Component Styling

**Glassmorphism Components:**
- [ ] Use `.glass-panel` for main containers
- [ ] Use `.glass-subtle` for secondary elements
- [ ] Zinc color palette (zinc-100 to zinc-900)
- [ ] Dark mode support with `dark:` variants

**Forms:**
- [ ] Glass panel backgrounds
- [ ] Clear labels with zinc-500 text
- [ ] Proper spacing (p-4, gap-4)
- [ ] Focus states (ring-blue-500)
- [ ] Error states (border-red-500/50)
- [ ] Success states (border-green-500/50)

**Buttons:**
- [ ] Primary: blue-600 background
- [ ] Danger: red-600 background
- [ ] Disabled: gray, cursor-not-allowed
- [ ] Loading: show spinner
- [ ] Hover effects with transitions
- [ ] Consistent sizing (px-4 py-2)

**Tables:**
- [ ] Glass panel wrapper
- [ ] Zinc borders (divide-zinc-200 dark:divide-zinc-700)
- [ ] Semi-transparent header (bg-zinc-50/50 dark:bg-zinc-900/50)
- [ ] Hover highlight
- [ ] Responsive padding
- [ ] Mobile scrollable

### Step 4.3: Loading States

Create loading spinner:
```javascript
function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  );
}
```

**Checklist:**
- [ ] Loading spinner component
- [ ] Used in dashboard
- [ ] Used in stats page
- [ ] Used in form submission
- [ ] Smooth animations

### Step 4.4: Empty States

**Checklist:**
- [ ] "No links yet" message
- [ ] Empty state in table
- [ ] Clear, friendly messaging
- [ ] Call to action visible

### Step 4.5: Error & Success States

**Error Messages:**
- [ ] Red background (bg-red-50)
- [ ] Red border
- [ ] Clear text
- [ ] Dismissible

**Success Messages:**
- [ ] Green background (bg-green-50)
- [ ] Checkmark icon
- [ ] Auto-dismiss after 3s
- [ ] Smooth transitions

### Step 4.6: Responsive Design

**Test at breakpoints:**
- [ ] Mobile (< 640px): stacked layout
- [ ] Tablet (640px - 1024px): adaptive
- [ ] Desktop (> 1024px): full width

**Mobile considerations:**
- [ ] Full-width inputs
- [ ] Stacked form fields
- [ ] Large touch targets (min 44px)
- [ ] Readable font sizes (16px+)
- [ ] Scrollable table
- [ ] Hamburger menu (if needed)

---

## Phase 5: Testing & Debugging (2-3 hours)

### Step 5.1: Manual Testing

**Create Link:**
- [ ] With custom code
- [ ] Without custom code
- [ ] Duplicate code (409 error)
- [ ] Invalid URL (validation error)
- [ ] Invalid code format (validation error)
- [ ] Very long URL
- [ ] Special characters in URL

**Redirect:**
- [ ] Visit /{code} redirects
- [ ] Click count increases
- [ ] last_clicked updates
- [ ] Non-existent code shows 404
- [ ] Multiple rapid clicks

**Delete:**
- [ ] Delete removes from table
- [ ] Deleted code returns 404
- [ ] Confirmation works
- [ ] Can't delete twice

**Stats Page:**
- [ ] Shows correct data
- [ ] Copy button works
- [ ] Back button works
- [ ] 404 for missing code
- [ ] Mobile responsive

**UI/UX:**
- [ ] All buttons work
- [ ] Forms validate
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Success feedback visible
- [ ] Mobile navigation works

### Step 5.2: API Testing Script

Create `test-api.sh`:
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "1. Health Check"
curl $BASE_URL/api/healthz

echo "\n\n2. Create Link"
curl -X POST $BASE_URL/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"test123"}'

echo "\n\n3. Get All Links"
curl $BASE_URL/api/links

echo "\n\n4. Get Single Link"
curl $BASE_URL/api/links/test123

echo "\n\n5. Test Redirect"
curl -I $BASE_URL/test123

echo "\n\n6. Delete Link"
curl -X DELETE $BASE_URL/api/links/test123

echo "\n\n7. Verify 404"
curl $BASE_URL/test123
```

Run: `chmod +x test-api.sh && ./test-api.sh`

**Checklist:**
- [ ] All endpoints respond
- [ ] Status codes correct
- [ ] Response formats match spec
- [ ] Errors handled properly

### Step 5.3: Browser Testing

**Test in:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Step 5.4: Edge Cases

- [ ] Very long URLs (2000+ chars)
- [ ] Unicode in URLs
- [ ] URLs with special characters
- [ ] Multiple simultaneous requests
- [ ] Network timeouts
- [ ] Database disconnection
- [ ] Invalid JSON payloads

---

## Phase 6: Deployment (2-3 hours)

### Step 6.1: Pre-Deployment

**Checklist:**
- [ ] All features work locally
- [ ] No console errors
- [ ] Environment variables documented
- [ ] `.env.example` created
- [ ] `.env.local` in `.gitignore`
- [ ] README written
- [ ] Clean git history

### Step 6.2: Push to GitHub

```bash
git add .
git commit -m "Complete TinyLink implementation"
git branch -M main
git remote add origin https://github.com/manishborikar92/tinylink.git
git push -u origin main
```

**Checklist:**
- [ ] Repository created
- [ ] Code pushed
- [ ] Repository set to public
- [ ] README visible

### Step 6.3: Deploy to Vercel

1. **Sign Up / Login:**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project:**
   - Click "New Project"
   - Select repository
   - Framework: Next.js (auto-detected)

3. **Configure:**
   - Build Command: (auto)
   - Output Directory: (auto)
   - Install Command: (auto)

4. **Environment Variables:**
   - Add `DATABASE_URL` from Neon
   - `NEXT_PUBLIC_BASE_URL` will be auto-set

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes

**Checklist:**
- [ ] Deployment successful
- [ ] Site accessible
- [ ] Environment variables set
- [ ] Domain assigned

### Step 6.4: Post-Deployment Testing

**Test on production:**
- [ ] Health check works
- [ ] Create link works
- [ ] Redirect works
- [ ] Stats page works
- [ ] Delete works
- [ ] Mobile works
- [ ] No console errors

**URLs to test:**
- https://your-app.vercel.app
- https://your-app.vercel.app/api/healthz
- https://your-app.vercel.app/api/links

---

## Phase 7: Documentation & Submission (1-2 hours)

### Step 7.1: Update README.md

```markdown
# TinyLink - URL Shortener

## 🔗 Live Demo
**App:** https://your-app.vercel.app
**Health Check:** https://your-app.vercel.app/api/healthz

## ✨ Features
- Create short links with custom or random codes
- Track click statistics in real-time
- View detailed analytics per link
- Responsive design for all devices
- Fast redirects with PostgreSQL

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## 🚀 Local Setup
1. Clone: `git clone https://github.com/manishborikar92/tinylink.git`
2. Install: `npm install`
3. Configure: Copy `.env.example` to `.env.local` and add your DATABASE_URL
4. Run: `npm run dev`
5. Open: http://localhost:3000

## 📡 API Endpoints
- `POST /api/links` - Create short link
- `GET /api/links` - List all links
- `GET /api/links/:code` - Get link stats
- `DELETE /api/links/:code` - Delete link
- `GET /:code` - Redirect to original URL
- `GET /api/healthz` - Health check

## 📝 Environment Variables
See `.env.example` for required variables.

## 📄 License
MIT
```

**Checklist:**
- [ ] Live URLs added
- [ ] Features listed
- [ ] Setup instructions clear
- [ ] API documented
- [ ] Tech stack listed

### Step 7.2: Record Video Walkthrough

**Structure (5-10 minutes):**

1. **Intro (30s):**
   - Your name
   - Project overview

2. **Live Demo (2-3 min):**
   - Show deployed app
   - Create link with custom code
   - Create link with random code
   - Test redirect (open in new tab)
   - View stats page
   - Delete a link
   - Show mobile view

3. **Code Walkthrough (3-5 min):**
   - Show project structure
   - Explain database schema
   - Walk through API routes
   - Show key components
   - Explain redirect logic
   - Show deployment config

4. **Wrap-up (1 min):**
   - Challenges faced
   - How you solved them
   - What you learned

**Tools:**
- **Loom:** https://loom.com (easiest)
- **OBS Studio:** Free, professional
- **Zoom:** Record meeting

**Tips:**
- Clear audio (use good mic)
- Readable screen resolution
- Prepare talking points
- Show, don't just tell
- Keep it under 10 minutes

**Checklist:**
- [ ] Video recorded
- [ ] Audio clear
- [ ] Screen readable
- [ ] Uploaded (YouTube/Loom)
- [ ] Link accessible

### Step 7.3: Final Submission

**Prepare submission with:**

1. **Live URL:**
   - https://your-app.vercel.app

2. **GitHub URL:**
   - https://github.com/manishborikar92/tinylink

3. **Video URL:**
   - https://loom.com/share/your-video

4. **LLM Transcript URL (if used):**
   - https://chat.openai.com/share/your-chat

**Final Checklist:**
- [ ] All URLs working
- [ ] GitHub repo public
- [ ] README complete
- [ ] Video accessible
- [ ] Code clean
- [ ] No secrets in code
- [ ] `.env.example` included
- [ ] All features working
- [ ] Mobile responsive
- [ ] No console errors

---

## Time Estimates

| Phase | Tasks | Time |
|-------|-------|------|
| 1 | Setup & Planning | 2-3h |
| 2 | Backend Implementation | 4-5h |
| 3 | Frontend Implementation | 5-6h |
| 4 | Styling & UX Polish | 2-3h |
| 5 | Testing & Debugging | 2-3h |
| 6 | Deployment | 2-3h |
| 7 | Documentation | 1-2h |
| **Total** | | **18-25h** |

---

## Recommended Schedule

### Day 1 (8-10 hours)
**Morning (4h):**
- Setup project
- Configure database
- Build backend APIs

**Afternoon (4h):**
- Create components
- Build dashboard
- Implement form

**Evening (2h):**
- Stats page
- Basic styling

### Day 2 (6-8 hours)
**Morning (3h):**
- Polish UI
- Responsive design
- Loading states

**Afternoon (3h):**
- Testing
- Bug fixes
- Deployment

**Evening (2h):**
- Documentation
- Video recording

---

## Troubleshooting

### Database Issues
**Problem:** Connection fails
**Solution:**
- Check DATABASE_URL format
- Verify `?sslmode=require`
- Test with: `psql $DATABASE_URL`
- Check Neon dashboard status

### Redirect Issues
**Problem:** 404 on /{code}
**Solution:**
- Verify `app/[code]/route.js` exists
- Check database has the code
- Test API endpoint first
- Check browser network tab

### Build Errors
**Problem:** Vercel build fails
**Solution:**
- Test locally: `npm run build`
- Check all imports correct
- Verify env vars set
- Review build logs

### Environment Variables
**Problem:** Vars not working
**Solution:**
- Prefix with `NEXT_PUBLIC_` for client
- Restart dev server
- Redeploy on Vercel
- Check Vercel dashboard

---

## Success Criteria

✅ **Functionality:**
- All API endpoints work
- Redirects increment clicks
- Stats display correctly
- Delete works properly

✅ **UI/UX:**
- Professional design
- Responsive layout
- Clear error messages
- Loading states

✅ **Code Quality:**
- Clean, organized code
- Proper error handling
- Meaningful commits
- Good README

✅ **Deployment:**
- Live on Vercel
- Database connected
- No errors
- Fast performance

Good luck! 🚀