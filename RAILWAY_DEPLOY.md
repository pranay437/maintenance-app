# Quick Railway Deployment Steps

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `maintenance-app` (or any name)
3. Make it Public or Private
4. Click "Create repository"
5. Copy the repository URL

## Step 2: Push Code to GitHub

Run these commands in your terminal:

```bash
cd c:\Users\Pranay\Downloads\app\MAN

# Update remote URL with your new repo
git remote remove origin
git remote add origin YOUR_NEW_GITHUB_REPO_URL

# Push code
git push -u origin master
```

## Step 3: Deploy on Railway

1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `maintenance-app` repository
6. Railway will auto-detect and start deploying

## Step 4: Add Environment Variables

1. Click on your deployed project
2. Go to "Variables" tab
3. Click "New Variable" and add:

```
MONGODB_URI = mongodb+srv://pranayumak4_db_user:Password_%402006@cluster0.avjyqvg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET = b709da036313b3a04581b5789723bdd0ac6198d71df51f71da0126b90d17cdbbd5f99aadc97eb28a6c162828bd565611e22b95ab68a016b1b936de871ed45dad

JWT_EXPIRES_IN = 7d

NODE_ENV = production
```

4. Click "Deploy" or wait for auto-redeploy

## Step 5: Get Your Live URL

1. Go to "Settings" tab
2. Click "Generate Domain"
3. Your app will be live at: `https://your-app-name.up.railway.app`

## Done! 🎉

Your maintenance app is now live and accessible worldwide!

---

## Alternative: Deploy Without GitHub

If you prefer not to use GitHub:

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables:
```bash
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set NODE_ENV="production"
railway variables set JWT_EXPIRES_IN="7d"
```
