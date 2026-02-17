# Netlify Deployment Guide

## Prerequisites
- Netlify account
- MongoDB Atlas account (free tier works)
- WhatsApp Business API credentials (optional for testing)

## Step 1: Prepare Your Repository
1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure all files are committed

## Step 2: Connect to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider
4. Select your repository

## Step 3: Configure Build Settings
Netlify should auto-detect settings from netlify.toml, but verify:
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Functions directory: `netlify/functions`

## Step 4: Set Environment Variables
In Netlify dashboard → Site settings → Environment variables, add:

### Required Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secure_random_string_min_32_chars
JWT_REFRESH_SECRET=your_secure_refresh_token_secret
NODE_ENV=production
```

### Optional (for WhatsApp functionality):
```
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id
WEBHOOK_VERIFY_TOKEN=your_verify_token
```

## Step 5: Deploy
1. Click "Deploy site"
2. Wait for build to complete (5-10 minutes)
3. Your site will be live at: `https://your-site-name.netlify.app`

## Step 6: Test Deployment
Visit these URLs to verify:
- Frontend: `https://your-site-name.netlify.app`
- Backend health: `https://your-site-name.netlify.app/api/health`

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### API Not Working
- Check Function logs in Netlify dashboard
- Verify environment variables are set
- Ensure MONGODB_URI is correct

### Database Connection Issues
- Whitelist Netlify IPs in MongoDB Atlas (or allow all: 0.0.0.0/0)
- Verify connection string format
- Check MongoDB Atlas cluster is running

## Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

## Notes
- Netlify Functions have a 10-second timeout on free tier
- MongoDB Atlas free tier (M0) is sufficient for testing
- Socket.io real-time features won't work on Netlify (use Heroku/Railway for that)
