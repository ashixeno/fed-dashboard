# Fed Funds Rate Dashboard
## Trading Discussion — Xeno-

Live Federal Reserve rate tracker — FOMC decisions, Dual Mandate, Yield Curve, Carry Trade and more.

---

## Features
- **100% Automatic** — No API key needed. Live data from NY Fed, Treasury.gov, BLS
- **Auto-refresh every 5 minutes** — Background polling
- **Supabase Database** — Annotations + Alert history saved permanently
- **Rate Change Alerts** — Toast + Browser notifications
- **Chart Annotations** — Mark key events, visible to all users
- **Dual Mandate Dashboard** — CPI gap, Unemployment gap, Policy pressure score

---

## Deploy in 10 Minutes

### Step 1 — Supabase (free)
1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
3. Go to **Settings → API** → copy `Project URL` and `anon public` key

### Step 2 — Vercel (free)
1. Go to [vercel.com](https://vercel.com) → Import Git repo  
   *(or drag this folder to vercel.com/new)*
2. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   CRON_SECRET                  = any-random-string
   ```
3. Click **Deploy** → Done!

Your dashboard will be live at `https://your-project.vercel.app`

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Data Sources (all free, no key needed)

| Data | Source | Refresh |
|---|---|---|
| Fed Funds Rate (EFFR) | NY Fed API | Daily |
| SOFR | NY Fed API | Daily |
| 2Y + 10Y Yields | Treasury.gov Fiscal Data API | Monthly |
| CPI Inflation | BLS Public API | Monthly |
| Unemployment | BLS Public API | Monthly |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Server component — fetches all data
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── live-data/        # Fetches + caches in Supabase
│       ├── annotations/      # CRUD annotations
│       └── alerts/           # Alert log
├── components/
│   ├── Dashboard.tsx         # Main client component
│   ├── Header.tsx
│   ├── NavBar.tsx            # Sticky with active highlighting
│   ├── LiveBar.tsx           # Countdown + Toast alerts
│   ├── KPIGrid.tsx
│   ├── RateChart.tsx         # Chart.js with annotations
│   ├── FOMCTable.tsx
│   ├── DualMandate.tsx       # Policy gap dashboard
│   ├── Charts.tsx            # YieldCurve, BalanceSheet, Mortgage, Macro
│   ├── AlertsPanel.tsx       # Supabase-synced alerts
│   └── AnnotationsPanel.tsx  # Supabase-synced annotations
└── lib/
    ├── supabase.ts           # DB client + all helpers
    ├── publicApis.ts         # NY Fed / Treasury / BLS fetchers
    └── constants.ts          # Historical data + colors
```

---

## © 2022–Present Trading Discussion
Exclusively for Trading Discussion mentorship students.
