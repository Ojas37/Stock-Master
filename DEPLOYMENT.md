# Deployment Guide for StockMaster

## 🚀 Quick Deployment

### Frontend (Vercel) + Backend (Render)

This is the recommended approach for free hosting.

---

## 📦 Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)** and sign up with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository:** `Ojas37/Stock-Master`

4. **Configure the service:**
   - **Name:** `stockmaster-backend`
   - **Region:** Oregon (US West) or closest to you
   - **Branch:** `main`
   - **Root Directory:** `my-app`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
   - **Instance Type:** `Free`

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
   EMAIL_USER=ojassachinneve@gmail.com
   EMAIL_PASSWORD=tsskklprrcwgqfkb
   OPENROUTER_API_KEY=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
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
   
   **Note:** Replace `FRONTEND_URL` after deploying frontend (Step 2)

6. **Click "Create Web Service"**

7. **Wait for deployment** (5-10 minutes)

8. **Copy your backend URL:** `https://stockmaster-backend.onrender.com`

---

## 🌐 Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)** and sign up with GitHub

2. **Click "Add New" → "Project"**

3. **Import `Ojas37/Stock-Master` repository**

4. **Configure the project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `my-app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. **Add Environment Variable:**
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://stockmaster-backend.onrender.com` (your Render URL from Step 1)

6. **Click "Deploy"**

7. **Wait for deployment** (2-3 minutes)

8. **Get your frontend URL:** `https://your-app-name.vercel.app`

---

## 🔄 Step 3: Update Backend CORS

1. **Go back to Render dashboard**

2. **Select your backend service**

3. **Go to "Environment" tab**

4. **Update `FRONTEND_URL`** with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

5. **Save Changes** - Render will automatically redeploy

---

## ✅ Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`

2. Try signing up with a new account

3. Check if OTP email arrives

4. Login and test the dashboard

5. Test the AI Chat Assistant

---

## 🎯 Your Deployed URLs

After deployment, you'll have:

- **Frontend:** `https://stockmaster-[your-id].vercel.app`
- **Backend API:** `https://stockmaster-backend.onrender.com`
- **Health Check:** `https://stockmaster-backend.onrender.com/health`

---

## 🔒 Security Notes

**⚠️ IMPORTANT:** Before deploying to production:

1. **Change JWT_SECRET** to a strong random string:
   ```bash
   # Generate a secure secret (use any method):
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Keep your .env.local file private** - Never commit it to GitHub

3. **Review CORS settings** - Only allow your frontend domain

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend not starting
- **Solution:** Check Render logs for errors
- **Check:** Environment variables are set correctly

**Problem:** Database errors
- **Solution:** SQLite will auto-create on first run
- **Note:** Render's free tier has ephemeral storage (data resets on restart)
- **Upgrade:** Use Render PostgreSQL for persistent storage (paid)

### Frontend Issues

**Problem:** API calls failing
- **Solution:** Check `NEXT_PUBLIC_API_URL` is set correctly
- **Check:** CORS is configured in backend

**Problem:** Build fails
- **Solution:** Check Vercel build logs
- **Verify:** All dependencies are in package.json

---

## 🆓 Free Tier Limits

### Render (Backend)
- ✅ 750 hours/month free
- ✅ Sleeps after 15 min inactivity
- ⚠️ First request after sleep takes ~30 seconds
- ⚠️ Ephemeral storage (data resets on restart)

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ Automatic SSL

---

## 🚀 Next Steps

1. **Custom Domain:** Add your own domain in Vercel settings
2. **Monitoring:** Set up Render health checks
3. **Database:** Consider upgrading to PostgreSQL for production
4. **Analytics:** Add Vercel Analytics

---

## 📝 Manual Deployment (Alternative)

If you prefer a single platform:

### Deploy Both on Render

1. Create **two separate services**:
   - One for backend (as above)
   - One for frontend (Next.js)

2. Frontend service config:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add `NEXT_PUBLIC_API_URL` env var

---

**Need help?** Check the logs in Render/Vercel dashboards or open an issue on GitHub!
