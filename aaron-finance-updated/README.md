# 🎀 Aaron Finance — Duit Aman, Hati Senang!

Web app manajemen keuangan personal untuk **Aaron Austen** 💙🌸

## ✨ Fitur Lengkap

- 🏠 **Dashboard** — Ringkasan net worth, arus kas, grafik, transaksi terkini
- 📋 **Manajemen Transaksi** — CRUD lengkap, filter, search, kategori, kebutuhan vs keinginan
- 📊 **Analitik** — Grafik bulanan, kategori terbesar, breakdown 50/30/20
- 💰 **Investasi** — Tracking emas & reksa dana dengan estimasi harga pasar real-time
- 🎯 **Budget** — Set budget per kategori, progress bar, alert over-budget
- 🏦 **Rekening** — Kelola saldo Bank BCA, Cash, E-Wallet, Tabungan
- 📝 **Catatan** — Sticky notes warna-warni untuk target & pengingat
- 💎 **Net Worth** — Total kekayaan = kas + investasi

## 🚀 Deploy

### Lokal
```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL
psql -U postgres -c "CREATE DATABASE aaron_finance;"
psql -U postgres -d aaron_finance -f db/schema.sql

# 3. Jalankan server
npm start
# atau npm run dev (dengan auto-reload)
```

### Railway / Render / Heroku
```bash
# Set environment variable:
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Deploy:
git push heroku main
# atau connect GitHub repo ke Railway/Render
```

### Docker (Opsional)
```bash
docker-compose up -d
```

## 📁 Struktur File
```
aaron-finance/
├── backend/
│   └── server.js          # Express API server
├── db/
│   └── schema.sql         # PostgreSQL schema + seed data
├── public/
│   ├── index.html         # SPA main HTML
│   └── src/
│       ├── style.css      # Pastel dream CSS 🌸
│       ├── app.js         # Core logic & API calls
│       ├── pages.js       # Page renderers
│       └── charts.js      # Chart.js renderers
├── package.json
└── README.md
```

## 🎨 Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Frontend**: Vanilla JS + HTML + CSS (no framework needed!)
- **Charts**: Chart.js 4.4
- **Fonts**: Fredoka One + Nunito (Google Fonts)

## 💡 Data Aaron Austen (Pre-loaded)
- Rekening BCA: Rp195,000
- Tabungan: Rp600,000
- Emas Antam 0.5 gram: Modal Rp700,000
- Reksa Dana: Modal Rp350,000
- Transaksi Jan-Mar 2026 sudah di-import!

Made with 💕 for Aaron Austen
