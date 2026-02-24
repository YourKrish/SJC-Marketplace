# Deploy this app so anyone can access it (free)

## Option 1: Vercel (recommended, ~2 minutes)

1. **Push your code to GitHub** (if you haven’t already)
   - Create a new repo at [github.com/new](https://github.com/new)
   - In your project folder run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub”).
   - Click **Add New…** → **Project**.
   - Import your GitHub repo (select it and click **Import**).
   - Leave **Build Command** as `npm run build` and **Output Directory** as `dist`.
   - Click **Deploy**.

3. **Done**
   - Vercel will build and give you a URL like `https://your-project.vercel.app`. Anyone can open it.

4. **Supabase (Google sign-in & API)**
   - In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**:
     - **Site URL:** set to your Vercel URL (e.g. `https://your-project.vercel.app`)
     - **Redirect URLs:** add `https://your-project.vercel.app/auth/callback` and `https://your-project.vercel.app`
   - In [Google Cloud Console](https://console.cloud.google.com) → your OAuth client → **Authorized JavaScript origins**, add your Vercel URL (e.g. `https://your-project.vercel.app`).

---

## Option 2: Netlify

1. Push your code to GitHub (same as above).

2. Go to [netlify.com](https://netlify.com) → **Sign up** / **Log in** → **Add new site** → **Import an existing project** → choose **GitHub** and your repo.

3. Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. Add a file `public/_redirects` with one line (for client-side routing):
   ```
   /*    /index.html   200
   ```
   Or create `netlify.toml` in the project root with:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

5. Deploy. Then update Supabase and Google OAuth URLs to use your Netlify URL (e.g. `https://your-site.netlify.app`).

---

After deployment, share your live URL; anyone can open it in a browser.
