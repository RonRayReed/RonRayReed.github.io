# Reed Intelligence Group — GitHub Pages Deployment Guide
## Target: RonRayReed.github.io

---

## What you're deploying

```
reedintel-v3/
├── index.html            ← Homepage (all four cities)
├── kyiv.html             ← Kyiv Business Intel
├── lviv.html             ← Lviv Business Intel
├── odesa.html            ← Odesa Business Intel
├── chisinau.html         ← Chisinau Business Intel
├── about.html            ← About Reed Intelligence Group
├── hiring.html           ← We're Hiring
├── css/
│   └── reedintel.css     ← All styles
├── js/
│   ├── reedintel.js      ← Live FX rates, theme, language, ticker
│   └── translations.js   ← EN / DE / UK / RU translations
└── articles/             ← 37 full article pages
    ├── world-bank-1-64b.html
    ├── kyivstar-5g-lviv.html
    ├── izmail-drone-strike.html
    ├── moldova-budget-2026.html
    └── ... (33 more)
```

**Key rule — paths:**  
All root pages (`index.html`, `kyiv.html`, etc.) use `css/reedintel.css` and `js/reedintel.js`.  
All article pages (in `articles/`) use `../css/reedintel.css` and `../js/reedintel.js`.  
Do not change these paths.

---

## Step 1 — Confirm your repository is ready

Your repository is `RonRayReed.github.io`. GitHub Pages serves this automatically at:  
**https://ronrayread.github.io**

Open GitHub.com, go to your repository, and confirm:
- The repository is **public** (required for free GitHub Pages)
- Go to **Settings → Pages** and confirm the source is set to **Deploy from branch: `main`** (or `master`), directory **`/ (root)`**

---

## Step 2 — Install Git (if not already installed)

**Mac:** Git is included with Xcode Command Line Tools. Run:
```bash
git --version
```
If not installed, macOS will prompt you to install it.

**Windows:** Download from https://git-scm.com/download/win and install with default options.

---

## Step 3 — Clone your repository

Open Terminal (Mac) or Git Bash (Windows) and run:

```bash
git clone https://github.com/RonRayReed/RonRayReed.github.io.git
cd RonRayReed.github.io
```

This creates a local copy of your repository on your computer.

---

## Step 4 — Copy the Reed Intel v3 files

You downloaded the Reed Intel v3 site as a zip file. Extract it. You should see a folder called `reedintel-v3` containing the files listed above.

**Copy everything inside `reedintel-v3/` into your cloned repository folder.**

The result should look like this inside `RonRayReed.github.io/`:

```
RonRayReed.github.io/
├── index.html
├── kyiv.html
├── lviv.html
├── odesa.html
├── chisinau.html
├── about.html
├── hiring.html
├── css/
│   └── reedintel.css
├── js/
│   ├── reedintel.js
│   └── translations.js
└── articles/
    ├── world-bank-1-64b.html
    └── ... (all 37 article files)
```

**Important:** Copy the files from inside `reedintel-v3/` — not the folder itself. Your `css/` and `js/` folders must be at the root of the repository, not inside a subfolder called `reedintel-v3/`.

---

## Step 5 — Stage and commit the files

In your terminal, make sure you are inside the `RonRayReed.github.io` directory:

```bash
cd RonRayReed.github.io
```

Add all the new files:

```bash
git add .
```

Commit with a message:

```bash
git commit -m "Reed Intel v3 — full site with 37 articles, live FX, 4-language i18n"
```

---

## Step 6 — Push to GitHub

```bash
git push origin main
```

If your default branch is called `master` instead of `main`:

```bash
git push origin master
```

GitHub will ask for your username and password (or Personal Access Token) if this is your first push from this machine.

**Personal Access Token:** GitHub no longer accepts passwords for git operations. If prompted for a password, use a Personal Access Token instead:  
1. Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)  
2. Generate a new token with `repo` scope  
3. Use this token as the password when git prompts you

---

## Step 7 — Wait for deployment

GitHub Pages typically deploys within 1–3 minutes of a push.

Go to: **https://github.com/RonRayReed/RonRayReed.github.io/actions**

You will see a deployment workflow running. When it shows a green checkmark, the site is live.

Visit: **https://ronrayread.github.io**

---

## Step 8 — Verify the deployment

Check these items:

| Item | URL to check |
|------|-------------|
| Homepage loads | https://ronrayread.github.io |
| Kyiv page loads | https://ronrayread.github.io/kyiv.html |
| Lviv page loads | https://ronrayread.github.io/lviv.html |
| Odesa page loads | https://ronrayread.github.io/odesa.html |
| Chisinau page loads | https://ronrayread.github.io/chisinau.html |
| Article loads | https://ronrayread.github.io/articles/world-bank-1-64b.html |
| CSS loads | https://ronrayread.github.io/css/reedintel.css |
| Live FX rates | Open any page — market strip should show ₴44.xx within 3 seconds |
| Language switcher | Click DE — all labels should switch to German |

If CSS is not loading, verify the `css/` folder is at the root of the repository and that the file path is exactly `css/reedintel.css` (lowercase).

---

## Custom domain (optional)

To serve the site from `reedintel.com` or `reedintel.news`:

1. Create a file named `CNAME` at the root of the repository containing your domain:
```
reedintel.com
```

2. At your DNS registrar (GoDaddy, Cloudflare, etc.), add:
   - An `A` record pointing to `185.199.108.153`
   - An `A` record pointing to `185.199.109.153`
   - An `A` record pointing to `185.199.110.153`
   - An `A` record pointing to `185.199.111.153`
   
   Or a `CNAME` record pointing `www` to `ronrayread.github.io`

3. In GitHub repository Settings → Pages, enter your custom domain and enable "Enforce HTTPS"

DNS propagation takes 15 minutes to 48 hours.

---

## Updating the site in future

Every time you update files:

```bash
cd RonRayReed.github.io
git add .
git commit -m "Describe what changed"
git push origin main
```

GitHub deploys automatically within 1–3 minutes.

---

## Updating FX policy rates

The live FX rate strip fetches USD/UAH, EUR/UAH, USD/MDL, EUR/MDL automatically from the Frankfurter.app API (ECB data, free, no API key required).

The NBU policy rate (13.5%) and BNM policy rate (3.60%) are **hardcoded** in `js/reedintel.js` and must be updated manually when the central banks change rates:

Open `js/reedintel.js` and find:
```javascript
const FX_FALLBACK = {
  USD_UAH: 44.06, EUR_UAH: 50.28,
  USD_MDL: 17.74, EUR_MDL: 20.26,
  NBU_RATE: '13.5%',   // ← update when NBU changes rate
  BNM_RATE: '3.60%',   // ← update when BNM changes rate
};
```

Update the rate values, save the file, and push to GitHub.

---

## File structure reference

```
Root files (use css/ and js/ paths):
  index.html, kyiv.html, lviv.html, odesa.html,
  chisinau.html, about.html, hiring.html

Article files (use ../css/ and ../js/ paths):
  articles/*.html  ← 37 articles

Assets (do not move):
  css/reedintel.css
  js/reedintel.js
  js/translations.js
```

**The css/ and js/ folders must remain at the root level** — the same level as index.html — for both the root pages and the articles/ subfolder to resolve paths correctly.

---

*Reed Intelligence Group — reedintel.com · reedintel.news*  
*Deployment guide v3 · April 2026*
