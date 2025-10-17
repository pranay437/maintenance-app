# Maintenance Request App

## Deployment Instructions

### 1. Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. Heroku
```bash
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
git push heroku main
```

### 3. Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Environment Variables
Set these in your deployment platform:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `NODE_ENV`: production
- `PORT`: 3001 (or platform default)

## Local Development
```bash
npm install
npm run dev
```