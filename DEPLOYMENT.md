# Deployment Guide - Maintenance Request App

## Prerequisites
- Git installed
- GitHub account
- MongoDB Atlas database (already configured)

## Deployment Options

### 1. Render (Recommended - Free Tier Available)

**Steps:**
1. Push code to GitHub
2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: maintenance-app
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add Environment Variables:
   - `MONGODB_URI`: (your MongoDB connection string)
   - `JWT_SECRET`: (your JWT secret)
   - `JWT_EXPIRES_IN`: 7d
   - `NODE_ENV`: production
7. Click "Create Web Service"

**URL:** Your app will be at `https://maintenance-app-xxxx.onrender.com`

---

### 2. Railway (Easy & Fast)

**Steps:**
1. Push code to GitHub
2. Go to https://railway.app and sign up
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `NODE_ENV`
6. Railway auto-detects and deploys

**URL:** Railway provides a custom domain

---

### 3. Vercel (Serverless)

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Push code to GitHub
3. Run: `vercel`
4. Follow prompts
5. Add environment variables in Vercel dashboard

**Note:** File uploads may need adjustment for serverless

---

### 4. Heroku

**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create maintenance-app`
4. Set environment variables:
   ```
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set JWT_EXPIRES_IN="7d"
   heroku config:set NODE_ENV="production"
   ```
5. Deploy: `git push heroku main`

---

## Quick Deploy Commands

### Push to GitHub (First Time)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maintenance-app.git
git push -u origin main
```

### Update Deployment
```bash
git add .
git commit -m "Update"
git push
```

---

## Environment Variables Required

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration (e.g., 7d)
- `NODE_ENV`: production
- `PORT`: (Auto-set by most platforms)

---

## Post-Deployment Checklist

✅ Test all API endpoints
✅ Verify MongoDB connection
✅ Test user registration/login
✅ Test complaint submission
✅ Check file uploads work
✅ Verify admin dashboard

---

## Troubleshooting

**Issue:** MongoDB connection fails
- Check MONGODB_URI is correct
- Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access

**Issue:** 404 errors
- Ensure all routes are properly configured
- Check build logs for errors

**Issue:** File uploads fail
- For serverless (Vercel), consider using cloud storage (AWS S3, Cloudinary)
- For traditional hosting (Render, Railway), uploads should work

---

## Recommended: Render

Render is recommended because:
- Free tier available
- Easy setup
- Supports file uploads
- Good performance
- Auto-deploys from GitHub
