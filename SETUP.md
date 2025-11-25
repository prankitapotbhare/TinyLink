# TinyLink Setup Guide

## Quick Start

### 1. Database Setup (Neon PostgreSQL)

1. Go to https://neon.tech and sign up
2. Create a new project named "tinylink"
3. In the SQL Editor, run the contents of `database/schema.sql`
4. Copy your connection string

### 2. Environment Configuration

Create `.env.local` in the project root:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

Replace the `DATABASE_URL` with your actual Neon connection string.

### 3. Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000

### 4. Test the Application

1. Create a link with a custom code
2. Create a link without a custom code (random)
3. Click on a link code to view stats
4. Test the redirect by visiting `http://localhost:3000/{code}`
5. Delete a link

### 5. API Testing

```bash
# Health check
curl http://localhost:3000/api/healthz

# Create link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"test123"}'

# Get all links
curl http://localhost:3000/api/links

# Get single link
curl http://localhost:3000/api/links/test123

# Test redirect (should return 302)
curl -I http://localhost:3000/test123

# Delete link
curl -X DELETE http://localhost:3000/api/links/test123
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TinyLink URL shortener"
git branch -M main
git remote add origin https://github.com/yourusername/tinylink.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

6. Add Environment Variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NODE_ENV`: production

7. Click "Deploy"

### 3. Post-Deployment

1. Visit your deployed URL
2. Test all features
3. Update `NEXT_PUBLIC_BASE_URL` in Vercel if needed

## Troubleshooting

### Database Connection Issues

**Problem:** "Connection failed" or "Database error"

**Solutions:**
- Verify `DATABASE_URL` is correct
- Ensure `?sslmode=require` is at the end
- Check Neon dashboard for database status
- Verify database schema is created

### Build Errors

**Problem:** Build fails on Vercel

**Solutions:**
- Run `npm run build` locally first
- Check all TypeScript errors
- Verify all environment variables are set
- Review build logs in Vercel

### Redirect Not Working

**Problem:** 404 when visiting `/{code}`

**Solutions:**
- Verify the code exists in database
- Check `src/app/[code]/route.ts` exists
- Test API endpoint first: `/api/links/{code}`
- Check browser network tab for errors

## Features Checklist

- [ ] Create link with custom code
- [ ] Create link with random code
- [ ] View all links in dashboard
- [ ] Click tracking works
- [ ] Stats page displays correctly
- [ ] Delete link works
- [ ] Redirect works (302)
- [ ] Dark mode toggle works
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Loading states show

## Production Checklist

- [ ] Database schema created
- [ ] Environment variables configured
- [ ] All features tested locally
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Deployed to Vercel
- [ ] Production URL works
- [ ] Health check returns 200
- [ ] All API endpoints work

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the Development Guide
3. Check Vercel deployment logs
4. Verify Neon database status
