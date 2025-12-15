# Deploying BDR Onboarding Calendar to Render

## Prerequisites
- GitHub repository pushed (✅ done: https://github.com/dzwiziski/sqabdronboarding)
- Render account (free tier available)

## Deployment Steps

### 1. Create Static Site on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub account if not already connected
4. Select repository: `dzwiziski/sqabdronboarding`

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Name** | `bdr-onboarding` (or your preference) |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3. Environment Variables (Optional for now)

No environment variables needed for the current localStorage version.

*When Firebase is added, you'll need:*
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
```

### 4. Deploy

Click **"Create Static Site"** — Render will:
1. Pull your code from GitHub
2. Run `npm install && npm run build`
3. Serve the `dist` folder

**First deploy takes ~2-3 minutes.**

### 5. Access Your App

Your app will be live at:
```
https://bdr-onboarding.onrender.com
```
(or whatever name you chose)

---

## Auto-Deploy

Render automatically redeploys when you push to `main`:
```bash
git add -A
git commit -m "your changes"
git push origin main
```

## Custom Domain (Optional)

1. In Render dashboard → your site → **Settings**
2. Scroll to **Custom Domains**
3. Add your domain and configure DNS
