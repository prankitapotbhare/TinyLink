# TinyLink Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Go to https://neon.tech
2. Sign up (free)
3. Create project "tinylink"
4. Open SQL Editor
5. Copy and paste from `schema.sql`
6. Run the SQL
7. Copy your connection string

### Step 2: Environment Setup (1 minute)

Create `.env.local` in project root:

```env
DATABASE_URL=your_neon_connection_string_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Install & Run (2 minutes)

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Step 4: Test It Out

1. Enter a URL: `https://google.com`
2. Enter custom code: `test`
3. Click "Create Short Link"
4. Click "Copy" button
5. Open new tab: `http://localhost:3000/test`
6. You'll be redirected to Google!

## 🎯 Quick Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🧪 Quick API Test

```bash
# Health check
curl http://localhost:3000/api/healthz

# Create link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customCode":"demo"}'

# Test redirect
curl -I http://localhost:3000/demo
```

## 📱 Features to Try

- ✅ Create link with custom code
- ✅ Create link without code (random)
- ✅ Click on code to view stats
- ✅ Copy short URL
- ✅ Delete a link
- ✅ Toggle dark mode (moon/sun icon)
- ✅ Test on mobile

## 🚢 Deploy to Vercel (5 minutes)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git push
```

2. Go to https://vercel.com
3. Import your repository
4. Add environment variable: `DATABASE_URL`
5. Click "Deploy"
6. Done! 🎉

## 🆘 Troubleshooting

**Database connection fails?**
- Check DATABASE_URL format
- Ensure `?sslmode=require` at end
- Verify Neon project is active

**Build fails?**
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies installed

**Redirect not working?**
- Check code exists in database
- Test API: `/api/links/yourcode`
- Check browser console for errors

## 📚 Documentation

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `PROJECT_STRUCTURE.md` - Architecture
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## 🎨 Customization

### Change Colors
Edit `src/app/globals.css`:
```css
:root {
  --background: #f4f4f5;  /* Light background */
  --foreground: #18181b;  /* Light text */
}

.dark {
  --background: #09090b;  /* Dark background */
  --foreground: #f4f4f5;  /* Dark text */
}
```

### Change Branding
Edit `src/components/Header.tsx`:
```tsx
<span className="text-2xl">🔗</span>  {/* Change emoji */}
<span className="text-xl font-bold">TinyLink</span>  {/* Change name */}
```

## 🎯 Next Steps

1. ✅ Set up database
2. ✅ Configure environment
3. ✅ Test locally
4. ⏳ Deploy to Vercel
5. ⏳ Share your short links!

---

**Need Help?** Check the full documentation in `SETUP.md`
