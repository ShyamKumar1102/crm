# Quick Netlify Deployment

## 🚀 Deploy in 5 Minutes

### 1. Install Netlify CLI (Optional - for local testing)
```bash
npm install -g netlify-cli
```

### 2. Test Locally (Optional)
```bash
# Install dependencies
npm install

# Test the build
npm run build

# Test with Netlify Dev (simulates Netlify environment)
netlify dev
```

### 3. Deploy to Netlify

#### Option A: Via Netlify Dashboard (Recommended)
1. Push code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Add environment variables (see below)
6. Click "Deploy"

#### Option B: Via CLI
```bash
# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### 4. Required Environment Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_32_character_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
NODE_ENV=production
```

### 5. MongoDB Setup
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (M0 free tier)
3. Create database user
4. Get connection string
5. Whitelist all IPs (0.0.0.0/0) for Netlify

### 6. Verify Deployment
- Frontend: `https://your-site.netlify.app`
- API Health: `https://your-site.netlify.app/api/health`

## 📝 Project Structure
```
├── frontend/          # React frontend
├── backend/           # Express backend (for reference)
├── netlify/
│   └── functions/
│       └── api.js     # Serverless backend
├── netlify.toml       # Netlify configuration
└── package.json       # Root dependencies
```

## ⚠️ Important Notes
- Socket.io real-time features won't work on Netlify (use Railway/Render for that)
- Netlify Functions timeout after 10 seconds (free tier)
- All backend code runs as serverless functions

## 🐛 Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
npm run build
```

### API returns 404
- Check netlify.toml redirects are correct
- Verify functions directory is set to `netlify/functions`

### Database connection fails
- Verify MONGODB_URI in environment variables
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Ensure database user has read/write permissions

## 📚 Full Documentation
See `NETLIFY_SETUP.md` for detailed instructions.
