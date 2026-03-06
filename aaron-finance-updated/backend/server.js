const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:anora@localhost:5432/aaron_finance',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const fmt = (data) => ({ success: true, data });
const errHandler = (e, res) => { console.error(e); res.status(500).json({ success: false, error: e.message }); };

// DASHBOARD
app.get('/api/dashboard', async (req, res) => {
  try {
    const [monthly, accounts, categories, investments, recent] = await Promise.all([
      pool.query(`SELECT year, month,
        SUM(CASE WHEN type='pemasukan' THEN amount ELSE 0 END) as pemasukan,
        SUM(CASE WHEN type='pengeluaran' THEN amount ELSE 0 END) as pengeluaran,
        SUM(CASE WHEN type='pemasukan' THEN amount ELSE -amount END) as sisa
        FROM transactions GROUP BY year, month ORDER BY year, month`),
      pool.query(`SELECT * FROM accounts WHERE is_active=true`),
      pool.query(`SELECT c.name, c.emoji, c.color, SUM(t.amount) as total
        FROM transactions t JOIN categories c ON t.category_id=c.id
        WHERE t.type='pengeluaran' GROUP BY c.name, c.emoji, c.color ORDER BY total DESC LIMIT 8`),
      pool.query(`SELECT * FROM investments WHERE is_active=true`),
      pool.query(`SELECT t.*, c.name as cat_name, c.emoji FROM transactions t
        JOIN categories c ON t.category_id=c.id ORDER BY t.date DESC, t.id DESC LIMIT 8`)
    ]);
    res.json(fmt({ monthly: monthly.rows, accounts: accounts.rows, top_categories: categories.rows, investments: investments.rows, recent: recent.rows }));
  } catch(e) { errHandler(e, res); }
});

// TRANSACTIONS
app.get('/api/transactions', async (req, res) => {
  try {
    const { month, year, type, search, limit=50, offset=0 } = req.query;
    let q = `SELECT t.*, c.name as cat_name, c.emoji, c.color, a.name as acc_name FROM transactions t JOIN categories c ON t.category_id=c.id JOIN accounts a ON t.account_id=a.id WHERE 1=1`;
    const p = [];
    if (month) { p.push(month); q += ` AND t.month=$${p.length}`; }
    if (year) { p.push(year); q += ` AND t.year=$${p.length}`; }
    if (type) { p.push(type); q += ` AND t.type=$${p.length}`; }
    if (search) { p.push(`%${search}%`); q += ` AND t.description ILIKE $${p.length}`; }
    p.push(limit, offset);
    q += ` ORDER BY t.date DESC, t.id DESC LIMIT $${p.length-1} OFFSET $${p.length}`;
    const r = await pool.query(q, p);
    res.json({ success: true, data: r.rows });
  } catch(e) { errHandler(e, res); }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { account_id, category_id, type, tipe_pengeluaran, amount, description, date, is_flagged, notes } = req.body;
    const r = await pool.query(
      `INSERT INTO transactions (account_id, category_id, type, tipe_pengeluaran, amount, description, date, is_flagged, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [account_id, category_id, type, tipe_pengeluaran, amount, description, date, is_flagged||false, notes]
    );
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { account_id, category_id, type, tipe_pengeluaran, amount, description, date, is_flagged, notes } = req.body;
    const r = await pool.query(
      `UPDATE transactions SET account_id=$1,category_id=$2,type=$3,tipe_pengeluaran=$4,amount=$5,description=$6,date=$7,is_flagged=$8,notes=$9 WHERE id=$10 RETURNING *`,
      [account_id, category_id, type, tipe_pengeluaran, amount, description, date, is_flagged, notes, req.params.id]
    );
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { errHandler(e, res); }
});

// ACCOUNTS
app.get('/api/accounts', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM accounts WHERE is_active=true ORDER BY id'); res.json(fmt(r.rows)); }
  catch(e) { errHandler(e, res); }
});
app.post('/api/accounts', async (req, res) => {
  try {
    const { name, type, balance, color, emoji } = req.body;
    const r = await pool.query('INSERT INTO accounts (name,type,balance,color,emoji) VALUES ($1,$2,$3,$4,$5) RETURNING *', [name, type, balance||0, color||'#a8d8ea', emoji||'💳']);
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});
app.put('/api/accounts/:id', async (req, res) => {
  try {
    const { balance } = req.body;
    const r = await pool.query('UPDATE accounts SET balance=$1 WHERE id=$2 RETURNING *', [balance, req.params.id]);
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});

// CATEGORIES
app.get('/api/categories', async (req, res) => {
  try {
    const { type } = req.query;
    const r = await pool.query(type ? 'SELECT * FROM categories WHERE type=$1 ORDER BY id' : 'SELECT * FROM categories ORDER BY type,id', type ? [type] : []);
    res.json(fmt(r.rows));
  } catch(e) { errHandler(e, res); }
});

// INVESTMENTS + NET WORTH
app.get('/api/investments', async (req, res) => {
  try {
    const [inv, prices] = await Promise.all([
      pool.query('SELECT * FROM investments WHERE is_active=true'),
      pool.query('SELECT * FROM market_prices ORDER BY fetched_at DESC')
    ]);
    const pm = {};
    prices.rows.forEach(p => { pm[p.asset_type] = parseFloat(p.price_per_unit); });
    const emas_price = pm['emas_per_gram'] || 1650000;
    const rd_mult = pm['reksadana_multiplier'] || 1.065;
    const enriched = inv.rows.map(i => {
      let cv = parseFloat(i.purchase_amount), gp = 0;
      if (i.type === 'emas') {
        cv = parseFloat(i.quantity) * emas_price;
        gp = ((cv - i.purchase_amount) / i.purchase_amount) * 100;
      } else if (i.type === 'reksadana') {
        const months = Math.max(0, Math.floor((Date.now() - new Date(i.purchase_date)) / (1000*60*60*24*30)));
        cv = parseFloat(i.purchase_amount) * Math.pow(1 + (rd_mult-1)/12, months);
        gp = ((cv - i.purchase_amount) / i.purchase_amount) * 100;
      }
      return { ...i, current_value: Math.round(cv), growth_pct: parseFloat(gp.toFixed(2)) };
    });
    res.json(fmt({ investments: enriched, prices: prices.rows }));
  } catch(e) { errHandler(e, res); }
});

app.post('/api/investments', async (req, res) => {
  try {
    const { name, type, purchase_amount, purchase_date, quantity, unit, notes, emoji, color } = req.body;
    const r = await pool.query(
      `INSERT INTO investments (name,type,purchase_amount,purchase_date,quantity,unit,notes,emoji,color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, type, purchase_amount, purchase_date, quantity||1, unit||'unit', notes, emoji||'📈', color||'#a8d8ea']
    );
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});

app.delete('/api/investments/:id', async (req, res) => {
  try {
    await pool.query('UPDATE investments SET is_active=false WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { errHandler(e, res); }
});

app.put('/api/market-prices', async (req, res) => {
  try {
    const { asset_type, price_per_unit, unit } = req.body;
    await pool.query('INSERT INTO market_prices (asset_type, price_per_unit, unit) VALUES ($1,$2,$3)', [asset_type, price_per_unit, unit]);
    res.json({ success: true });
  } catch(e) { errHandler(e, res); }
});

app.get('/api/networth', async (req, res) => {
  try {
    const [acc, inv, prices] = await Promise.all([
      pool.query('SELECT SUM(balance) as total FROM accounts WHERE is_active=true'),
      pool.query('SELECT * FROM investments WHERE is_active=true'),
      pool.query('SELECT * FROM market_prices')
    ]);
    const pm = {};
    prices.rows.forEach(p => { pm[p.asset_type] = parseFloat(p.price_per_unit); });
    let iv = 0;
    inv.rows.forEach(i => {
      if (i.type === 'emas') iv += parseFloat(i.quantity) * (pm['emas_per_gram'] || 1650000);
      else if (i.type === 'reksadana') {
        const m = Math.max(0, Math.floor((Date.now() - new Date(i.purchase_date)) / (1000*60*60*24*30)));
        iv += parseFloat(i.purchase_amount) * Math.pow(1 + ((pm['reksadana_multiplier']||1.065)-1)/12, m);
      } else iv += parseFloat(i.purchase_amount);
    });
    const cash = parseFloat(acc.rows[0].total || 0);
    res.json(fmt({ cash: Math.round(cash), investments: Math.round(iv), total: Math.round(cash + iv) }));
  } catch(e) { errHandler(e, res); }
});

// BUDGETS
app.get('/api/budgets', async (req, res) => {
  try {
    const { month=new Date().getMonth()+1, year=new Date().getFullYear() } = req.query;
    const r = await pool.query(
      `SELECT b.*, c.name, c.emoji, c.color,
        COALESCE((SELECT SUM(t.amount) FROM transactions t WHERE t.category_id=b.category_id AND t.month=b.month AND t.year=b.year AND t.type='pengeluaran'),0) as spent
       FROM budgets b JOIN categories c ON b.category_id=c.id WHERE b.month=$1 AND b.year=$2`, [month, year]
    );
    res.json(fmt(r.rows));
  } catch(e) { errHandler(e, res); }
});
app.post('/api/budgets', async (req, res) => {
  try {
    const { category_id, amount, month, year } = req.body;
    const r = await pool.query(
      `INSERT INTO budgets (category_id,amount,month,year) VALUES ($1,$2,$3,$4) ON CONFLICT (category_id,month,year) DO UPDATE SET amount=$2 RETURNING *`,
      [category_id, amount, month, year]
    );
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});
app.delete('/api/budgets/:id', async (req, res) => {
  try { await pool.query('DELETE FROM budgets WHERE id=$1', [req.params.id]); res.json({ success: true }); }
  catch(e) { errHandler(e, res); }
});

// ANALYTICS
app.get('/api/analytics', async (req, res) => {
  try {
    const { year=2026, month='' } = req.query;
    const hasMonth = month && month !== '';
    // Build WHERE clause: always filter by year, optionally also by month
    const whereYear   = hasMonth ? 'year=$1 AND month=$2' : 'year=$1';
    const params      = hasMonth ? [year, month] : [year];
    const paramsCat   = hasMonth ? [year, month] : [year];

    const [monthly, byCategory, byType] = await Promise.all([
      // monthly chart — when a specific month is chosen, still return all months for context
      pool.query(`SELECT month, SUM(CASE WHEN type='pemasukan' THEN amount ELSE 0 END) as pemasukan, SUM(CASE WHEN type='pengeluaran' THEN amount ELSE 0 END) as pengeluaran FROM transactions WHERE year=$1 GROUP BY month ORDER BY month`, [year]),
      pool.query(`SELECT c.name, c.emoji, c.color, SUM(t.amount) as total FROM transactions t JOIN categories c ON t.category_id=c.id WHERE t.type='pengeluaran' AND ${whereYear.replace('year=$1','t.year=$1').replace('month=$2','t.month=$2')} GROUP BY c.name,c.emoji,c.color ORDER BY total DESC`, paramsCat),
      pool.query(`SELECT tipe_pengeluaran, SUM(amount) as total FROM transactions WHERE type='pengeluaran' AND ${whereYear} AND tipe_pengeluaran IS NOT NULL GROUP BY tipe_pengeluaran`, params)
    ]);
    res.json(fmt({ monthly: monthly.rows, by_category: byCategory.rows, by_type: byType.rows, selected_month: month, year }));
  } catch(e) { errHandler(e, res); }
});

// NOTES
app.get('/api/notes', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM notes ORDER BY created_at DESC'); res.json(fmt(r.rows)); }
  catch(e) { errHandler(e, res); }
});
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, emoji, color } = req.body;
    const r = await pool.query('INSERT INTO notes (title,content,emoji,color) VALUES ($1,$2,$3,$4) RETURNING *', [title, content, emoji||'📝', color||'#ffd1dc']);
    res.json(fmt(r.rows[0]));
  } catch(e) { errHandler(e, res); }
});
app.delete('/api/notes/:id', async (req, res) => {
  try { await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]); res.json({ success: true }); }
  catch(e) { errHandler(e, res); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🎀 Aaron Finance running on http://localhost:${PORT}`));
