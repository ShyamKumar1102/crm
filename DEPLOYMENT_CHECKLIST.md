# ✅ Netlify Deployment Checklist

## Pre-Deployment

### 1. Code Repository
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] All changes committed
- [ ] .env files NOT committed (check .gitignore)

### 2. MongoDB Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free tier is fine)
- [ ] Database user created with password
- [ ] Network access: 0.0.0.0/0 whitelisted (for Netlify)
- [ ] Connection string copied

### 3. Environment Variables Ready
Prepare these values:
- [ ] MONGODB_URI (from MongoDB Atlas)
- [ ] JWT_SECRET (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] JWT_REFRESH_SECRET (generate another one)
- [ ] NODE_ENV=production

Optional (for WhatsApp):
- [ ] WHATSAPP_ACCESS_TOKEN
- [ ] WHATSAPP_PHONE_NUMBER_ID
- [ ] WHATSAPP_BUSINESS_ACCOUNT_ID
- [ ] WEBHOOK_VERIFY_TOKEN

## Netlify Setup

### 4. Create Netlify Site
- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site"
- [ ] Choose "Import an existing project"
- [ ] Connect Git provider
- [ ] Select repository

### 5. Build Settings
Verify these are set (should auto-detect from netlify.toml):
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/dist`
- [ ] Functions directory: `netlify/functions`

### 6. Environment Variables
In Site settings → Environment variables, add:
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] NODE_ENV
- [ ] (Optional) WhatsApp variables

### 7. Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build (5-10 minutes)
- [ ] Check build logs for errors

## Post-Deployment Testing

### 8. Verify Deployment
Test these URLs (replace YOUR-SITE with your Netlify subdomain):

- [ ] Frontend: `https://YOUR-SITE.netlify.app`
  - Should load the login page
  
- [ ] Backend health: `https://YOUR-SITE.netlify.app/api/health`
  - Should return: `{"status":"ok","message":"Backend running on Netlify",...}`

- [ ] Test registration:
  ```bash
  curl -X POST https://YOUR-SITE.netlify.app/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","password":"testpass123","businessName":"Test Business"}'
  ```

- [ ] Test login:
  ```bash
  curl -X POST https://YOUR-SITE.netlify.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"testpass123"}'
  ```

### 9. Check Logs
- [ ] Netlify Dashboard → Functions → View logs
- [ ] Look for any errors
- [ ] Verify MongoDB connection successful

## Common Issues & Fixes

### Build Fails
- Check Node version compatibility
- Clear cache: Site settings → Build & deploy → Clear cache
- Check build logs for specific errors

### API Returns 404
- Verify netlify.toml is in root directory
- Check Functions directory is set to `netlify/functions`
- Redeploy site

### Database Connection Fails
- Verify MONGODB_URI is correct
- Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions
- Check Function logs for connection errors

### CORS Errors
- Already handled in netlify/functions/api.js
- If issues persist, check browser console for specific error

### Function Timeout
- Netlify free tier: 10 second timeout
- Optimize slow database queries
- Consider upgrading Netlify plan if needed

## Success Criteria
- [ ] Frontend loads without errors
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] API health endpoint returns success
- [ ] No errors in Function logs
- [ ] MongoDB shows new user data

## Next Steps
- [ ] Set up custom domain (optional)
- [ ] Configure WhatsApp Business API (optional)
- [ ] Set up monitoring/alerts
- [ ] Configure backup strategy for MongoDB

## Support
If you encounter issues:
1. Check Netlify Function logs
2. Check MongoDB Atlas logs
3. Verify all environment variables are set correctly
4. Review netlify.toml configuration
5. Check browser console for frontend errors

## Notes
- Socket.io real-time features won't work on Netlify (serverless limitation)
- For real-time features, consider Railway, Render, or Heroku
- Netlify Functions are stateless - no persistent connections
- Free tier has 125k requests/month limit
