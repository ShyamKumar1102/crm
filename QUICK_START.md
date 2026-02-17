# 🎯 QUICK DEPLOY GUIDE

## 1️⃣ MongoDB Setup (5 minutes)
```
1. Go to https://cloud.mongodb.com
2. Create free cluster (M0)
3. Create database user
4. Network Access → Add IP: 0.0.0.0/0
5. Copy connection string
```

## 2️⃣ Generate Secrets
```bash
# Run this twice to get two different secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3️⃣ Netlify Deploy
```
1. Push code to GitHub
2. Go to https://app.netlify.com
3. "Add new site" → "Import project"
4. Select your repo
5. Add these environment variables:
   - MONGODB_URI=<your-connection-string>
   - JWT_SECRET=<generated-secret-1>
   - JWT_REFRESH_SECRET=<generated-secret-2>
   - NODE_ENV=production
6. Click "Deploy site"
7. Wait 5-10 minutes
```

## 4️⃣ Test
```
Visit: https://your-site.netlify.app
API: https://your-site.netlify.app/api/health
```

## ✅ Done!

See DEPLOYMENT_CHECKLIST.md for detailed steps.
