/* ============================================================
   🎀 Aaron Finance — Page Renderers
   ============================================================ */

// ── DASHBOARD ─────────────────────────────────────────────
async function renderDashboard() {
  showLoading();
  const [dash, nw] = await Promise.all([api('/dashboard'), api('/networth')]);
  if (!dash.success) { document.getElementById('content').innerHTML = '<p>Error loading data 😢</p>'; return; }
  
  const { monthly, accounts, top_categories, recent } = dash.data;
  const thisMonth = monthly[monthly.length - 1] || {};
  const prevMonth = monthly[monthly.length - 2] || {};
  const networthData = nw.success ? nw.data : { cash: 0, investments: 0, total: 0 };
  
  document.getElementById('content').innerHTML = `
    <!-- Net Worth Banner -->
    <div class="networth-banner">
      <div class="networth-label">💎 Total Kekayaan Aaron Austen</div>
      <div class="networth-value">${formatRp(networthData.total)}</div>
      <div class="networth-sub">Ayo terus ditabung dan diinvestasikan! 💪✨</div>
      <div class="networth-breakdown">
        <div class="nw-item">
          <div class="nw-item-label">🏦 Kas & Bank</div>
          <div class="nw-item-val">${formatRp(networthData.cash, true)}</div>
        </div>
        <div class="nw-item">
          <div class="nw-item-label">📈 Investasi</div>
          <div class="nw-item-val">${formatRp(networthData.investments, true)}</div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid" style="margin-bottom:24px">
      <div class="stat-card pink">
        <span class="stat-icon">💸</span>
        <span class="stat-label">Pengeluaran Bulan Ini</span>
        <span class="stat-value">${formatRp(thisMonth.pengeluaran || 0, true)}</span>
        <span class="stat-sub">${thisMonth.month ? MONTHS_FULL[thisMonth.month-1] + ' ' + thisMonth.year : 'Belum ada data'}</span>
      </div>
      <div class="stat-card blue">
        <span class="stat-icon">💰</span>
        <span class="stat-label">Pemasukan Bulan Ini</span>
        <span class="stat-value">${formatRp(thisMonth.pemasukan || 0, true)}</span>
        <span class="stat-sub" style="color:${(thisMonth.sisa||0)>=0?'#27ae60':'#e74c3c'}">${(thisMonth.sisa||0)>=0?'✅ Surplus':'⚠️ Defisit'}: ${formatRp(Math.abs(thisMonth.sisa||0), true)}</span>
      </div>
      <div class="stat-card mint">
        <span class="stat-icon">🐷</span>
        <span class="stat-label">Total Tabungan</span>
        <span class="stat-value">${formatRp(accounts.find(a=>a.type==='bank'&&a.name.includes('Tabungan'))?.balance || 0, true)}</span>
        <span class="stat-sub">Rekening Tabungan</span>
      </div>
      <div class="stat-card lavender">
        <span class="stat-icon">📊</span>
        <span class="stat-label">Total Transaksi Bulan Ini</span>
        <span class="stat-value">${recent.filter(t=>{ const d=new Date(t.date); return d.getMonth()===new Date().getMonth(); }).length}</span>
        <span class="stat-sub">transaksi tercatat</span>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid-2" style="margin-bottom:24px">
      <!-- Monthly Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📊 Arus Kas Bulanan</div>
        </div>
        <div class="chart-wrap">
          <canvas id="chart-monthly"></canvas>
        </div>
      </div>
      
      <!-- Category Donut -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🍩 Komposisi Pengeluaran</div>
        </div>
        <div class="chart-wrap">
          <canvas id="chart-donut"></canvas>
        </div>
      </div>
    </div>

    <!-- Accounts + Recent -->
    <div class="grid-2">
      <!-- Accounts -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🏦 Rekening & Dompet</div>
          <button class="btn-blue btn-sm" onclick="navigate('accounts')">Lihat Semua</button>
        </div>
        <div class="acc-grid" style="grid-template-columns:1fr 1fr;">
          ${accounts.map(a => `
            <div class="acc-card" style="border-color:${a.color}40;background:${a.color}15">
              <div class="acc-emoji">${a.emoji}</div>
              <div class="acc-name">${a.name}</div>
              <div class="acc-type">${a.type}</div>
              <div class="acc-balance">${formatRp(a.balance)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🕐 Transaksi Terkini</div>
          <button class="btn-blue btn-sm" onclick="navigate('transactions')">Lihat Semua</button>
        </div>
        <div class="txn-list">
          ${recent.length ? recent.map(t => renderTxnItem(t)).join('') : '<div class="empty-state"><div class="empty-state-icon">🫙</div><div class="empty-state-title">Belum ada transaksi</div></div>'}
        </div>
      </div>
    </div>
  `;
  
  // Render charts
  setTimeout(() => {
    renderMonthlyChart('chart-monthly', monthly);
    renderDonutChart('chart-donut', top_categories);
  }, 100);
}

function renderTxnItem(t) {
  const isIncome = t.type === 'pemasukan';
  const sign = isIncome ? '+' : '-';
  return `
    <div class="txn-item ${t.is_flagged ? 'flagged' : ''}" onclick="editTransaction(${JSON.stringify(t).replace(/"/g,'&quot;')})">
      <div class="txn-emoji" style="background:${t.color || '#ffd1dc'}30">${t.emoji || '💸'}</div>
      <div class="txn-info">
        <div class="txn-desc">${t.description || t.cat_name}</div>
        <div class="txn-meta">
          ${formatDate(t.date)} · ${t.cat_name}
          ${t.is_flagged ? '<span class="txn-badge badge-flagged">⚠️ Review</span>' : ''}
          ${t.tipe_pengeluaran ? `<span class="txn-badge badge-${t.tipe_pengeluaran}">${t.tipe_pengeluaran}</span>` : ''}
        </div>
      </div>
      <div class="txn-amount ${t.type}">${sign}${formatRp(t.amount)}</div>
    </div>`;
}

// ── TRANSACTIONS ─────────────────────────────────────────
let txnFilters = { month: '', year: 2026, type: '', search: '' };

async function renderTransactions() {
  showLoading();
  const params = new URLSearchParams();
  if (txnFilters.month) params.set('month', txnFilters.month);
  if (txnFilters.year) params.set('year', txnFilters.year);
  if (txnFilters.type) params.set('type', txnFilters.type);
  if (txnFilters.search) params.set('search', txnFilters.search);
  
  const res = await api('/transactions?' + params);
  if (!res.success) return;
  
  const txns = res.data;
  const totalIn = txns.filter(t=>t.type==='pemasukan').reduce((s,t)=>s+parseFloat(t.amount),0);
  const totalOut = txns.filter(t=>t.type==='pengeluaran').reduce((s,t)=>s+parseFloat(t.amount),0);
  
  document.getElementById('content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div class="section-title">📋 Semua Transaksi</div>
      <button class="btn-primary" onclick="openModal('modal-txn');resetTxnForm()">+ Tambah Transaksi</button>
    </div>

    <!-- Summary Strip -->
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card blue"><span class="stat-icon">💰</span><span class="stat-label">Total Masuk</span><span class="stat-value" style="color:#27ae60">+${formatRp(totalIn)}</span></div>
      <div class="stat-card pink"><span class="stat-icon">💸</span><span class="stat-label">Total Keluar</span><span class="stat-value" style="color:#e74c3c">-${formatRp(totalOut)}</span></div>
      <div class="stat-card ${totalIn-totalOut>=0?'mint':'pink'}"><span class="stat-icon">${totalIn-totalOut>=0?'✅':'⚠️'}</span><span class="stat-label">Selisih</span><span class="stat-value" style="color:${totalIn-totalOut>=0?'#27ae60':'#e74c3c'}">${totalIn-totalOut>=0?'+':''}${formatRp(totalIn-totalOut)}</span></div>
      <div class="stat-card lavender"><span class="stat-icon">📑</span><span class="stat-label">Jumlah Transaksi</span><span class="stat-value">${txns.length}</span></div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      🔍
      <input type="text" placeholder="Cari transaksi..." value="${txnFilters.search}" 
        onchange="txnFilters.search=this.value;renderTransactions()" 
        style="flex:1;min-width:150px">
      <select onchange="txnFilters.month=this.value;renderTransactions()">
        <option value="">Semua Bulan</option>
        ${MONTHS_FULL.map((m,i)=>`<option value="${i+1}" ${txnFilters.month==i+1?'selected':''}>${m}</option>`).join('')}
      </select>
      <select onchange="txnFilters.type=this.value;renderTransactions()">
        <option value="">Semua Tipe</option>
        <option value="pengeluaran" ${txnFilters.type==='pengeluaran'?'selected':''}>😭 Pengeluaran</option>
        <option value="pemasukan" ${txnFilters.type==='pemasukan'?'selected':''}>😍 Pemasukan</option>
      </select>
    </div>

    <!-- Transaction List -->
    <div class="card">
      <div class="txn-list" id="txn-list">
        ${txns.length ? txns.map(t => renderTxnRow(t)).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">🫙</div>
            <div class="empty-state-title">Belum ada transaksi nih~</div>
            <div class="empty-state-sub">Tambah transaksi pertamamu! 🌸</div>
          </div>`}
      </div>
    </div>
  `;
}

function renderTxnRow(t) {
  const isIncome = t.type === 'pemasukan';
  return `
    <div class="txn-item ${t.is_flagged ? 'flagged' : ''}" style="cursor:default">
      <div class="txn-emoji" style="background:${t.color||'#ffd1dc'}30">${t.emoji||'💸'}</div>
      <div class="txn-info">
        <div class="txn-desc">${t.description || t.cat_name}</div>
        <div class="txn-meta">
          ${formatDate(t.date)} · ${t.cat_name} · <span style="opacity:.6">${t.acc_name||''}</span>
          ${t.is_flagged ? '<span class="txn-badge badge-flagged">⚠️ Review</span>' : ''}
          ${t.tipe_pengeluaran ? `<span class="txn-badge badge-${t.tipe_pengeluaran}">${t.tipe_pengeluaran}</span>` : ''}
        </div>
      </div>
      <div class="txn-amount ${t.type}">${isIncome?'+':'-'}${formatRp(t.amount)}</div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button class="btn-blue btn-sm" onclick='editTransaction(${JSON.stringify(t)})'>✏️</button>
        <button class="btn-danger" onclick="deleteTransaction(${t.id})">🗑️</button>
      </div>
    </div>`;
}

// ── ANALYTICS ────────────────────────────────────────────
let analyticsMonth = ''; // '' = semua bulan

async function renderAnalytics(month) {
  if (month !== undefined) analyticsMonth = month;
  showLoading();
  const query = analyticsMonth ? `/analytics?year=2026&month=${analyticsMonth}` : '/analytics?year=2026';
  const res = await api(query);
  if (!res.success) return;
  
  const { monthly, by_category, by_type } = res.data;
  const totalOut = by_category.reduce((s,c)=>s+parseFloat(c.total),0);
  const kebutuhan = by_type.find(t=>t.tipe_pengeluaran==='kebutuhan');
  const keinginan = by_type.find(t=>t.tipe_pengeluaran==='keinginan');
  const monthLabel = analyticsMonth ? MONTHS_FULL[analyticsMonth-1] + ' 2026' : 'Semua Bulan 2026';
  
  document.getElementById('content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div class="section-title">📊 Analitik Keuangan 2026</div>
      <div class="filter-bar" style="margin:0;padding:10px 16px">
        <span style="font-weight:700;color:var(--text-muted)">📅 Pilih Bulan:</span>
        <select onchange="renderAnalytics(this.value)" style="font-family:Nunito,sans-serif;font-weight:600">
          <option value="" ${!analyticsMonth?'selected':''}>Semua Bulan</option>
          ${MONTHS_FULL.map((m,i)=>`<option value="${i+1}" ${analyticsMonth==i+1?'selected':''}>${m} 2026</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Type summary -->
    <div class="stats-grid" style="margin-bottom:24px">
      <div class="stat-card blue">
        <span class="stat-icon">✅</span>
        <span class="stat-label">Kebutuhan</span>
        <span class="stat-value">${formatRp(kebutuhan?.total||0, true)}</span>
        <span class="stat-sub">${totalOut>0?((kebutuhan?.total||0)/totalOut*100).toFixed(1):0}% dari total pengeluaran</span>
      </div>
      <div class="stat-card pink">
        <span class="stat-icon">🛍️</span>
        <span class="stat-label">Keinginan</span>
        <span class="stat-value">${formatRp(keinginan?.total||0, true)}</span>
        <span class="stat-sub">${totalOut>0?((keinginan?.total||0)/totalOut*100).toFixed(1):0}% dari total pengeluaran</span>
      </div>
      <div class="stat-card mint">
        <span class="stat-icon">💸</span>
        <span class="stat-label">Total Pengeluaran</span>
        <span class="stat-value">${formatRp(totalOut, true)}</span>
        <span class="stat-sub">${monthLabel}</span>
      </div>
      <div class="stat-card lavender">
        <span class="stat-icon">📈</span>
        <span class="stat-label">Rata-rata/Bulan</span>
        <span class="stat-value">${monthly.length ? formatRp(totalOut / monthly.length, true) : 'Rp0'}</span>
        <span class="stat-sub">dari ${monthly.length} bulan</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid-2" style="margin-bottom:24px">
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">📊 Perbandingan Pemasukan vs Pengeluaran</div>
        <div class="chart-wrap tall"><canvas id="chart-bar"></canvas></div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">🍩 Kategori Terbesar — ${monthLabel}</div>
        <div class="chart-wrap tall"><canvas id="chart-cat"></canvas></div>
      </div>
    </div>

    <!-- Needs vs Wants Chart -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-title" style="margin-bottom:16px">⚖️ Kebutuhan vs Keinginan per Bulan</div>
      <div class="tip-box">
        <span class="tip-icon">💡</span>
        <span>Aturan 50/30/20: Kebutuhan ≤ 50%, Keinginan ≤ 30%, Tabungan ≥ 20%. Ayo Aaron kita bisa!</span>
      </div>
      <div class="chart-wrap tall"><canvas id="chart-needs"></canvas></div>
    </div>

    <!-- Category Table -->
    <div class="card">
      <div class="card-title" style="margin-bottom:16px">🏷️ Rincian per Kategori — ${monthLabel}</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Kategori</th><th>Total</th><th>% dari Pengeluaran</th></tr></thead>
          <tbody>
            ${by_category.length ? by_category.map((c,i) => `
              <tr>
                <td>${i+1}</td>
                <td>${c.emoji} ${c.name}</td>
                <td style="font-weight:700;color:#e74c3c">-${formatRp(c.total)}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:100px;height:8px">
                      <div class="progress-fill ok" style="width:${totalOut>0?(c.total/totalOut*100).toFixed(1):0}%"></div>
                    </div>
                    ${totalOut>0?(c.total/totalOut*100).toFixed(1):0}%
                  </div>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px">Belum ada data pengeluaran untuk bulan ini 🫙</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    renderBarChart('chart-bar', monthly);
    renderCategoryChart('chart-cat', by_category.slice(0,7));
    renderNeedsWantsChart('chart-needs', monthly, by_type);
  }, 100);
}

// ── INVESTMENTS ──────────────────────────────────────────
async function renderInvestments() {
  showLoading();
  const [invRes, nwRes] = await Promise.all([api('/investments'), api('/networth')]);
  if (!invRes.success) return;
  
  const { investments, prices } = invRes.data;
  const nw = nwRes.success ? nwRes.data : { total: 0, investments: 0 };
  const goldPrice = prices.find(p=>p.asset_type==='emas_per_gram')?.price_per_unit || 1650000;
  const rdMult = prices.find(p=>p.asset_type==='reksadana_multiplier')?.price_per_unit || 1.065;
  
  const totalInv = investments.reduce((s,i)=>s+parseFloat(i.current_value||i.purchase_amount),0);
  const totalModal = investments.reduce((s,i)=>s+parseFloat(i.purchase_amount),0);
  const totalGain = totalInv - totalModal;
  
  document.getElementById('content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div class="section-title">💰 Portofolio Investasi Aaron</div>
      <button class="btn-primary" onclick="openModal('modal-inv');updateInvForm()">+ Investasi Baru</button>
    </div>

    <div class="stats-grid" style="margin-bottom:24px">
      <div class="stat-card yellow">
        <span class="stat-icon">📈</span>
        <span class="stat-label">Total Nilai Investasi</span>
        <span class="stat-value">${formatRp(totalInv, true)}</span>
        <span class="stat-sub">dari modal ${formatRp(totalModal, true)}</span>
      </div>
      <div class="stat-card ${totalGain>=0?'mint':'pink'}">
        <span class="stat-icon">${totalGain>=0?'🚀':'📉'}</span>
        <span class="stat-label">Keuntungan / Kerugian</span>
        <span class="stat-value" style="color:${totalGain>=0?'#27ae60':'#e74c3c'}">${totalGain>=0?'+':''}${formatRp(totalGain, true)}</span>
        <span class="stat-sub">${totalModal>0?(totalGain/totalModal*100).toFixed(2)+'% return':'—'}</span>
      </div>
      <div class="stat-card blue">
        <span class="stat-icon">🥇</span>
        <span class="stat-label">Harga Emas Saat Ini</span>
        <span class="stat-value">${formatRp(parseFloat(goldPrice), true)}<span style="font-size:0.7rem">/gram</span></span>
        <span class="stat-sub">Estimasi harga Antam</span>
      </div>
      <div class="stat-card lavender">
        <span class="stat-icon">📊</span>
        <span class="stat-label">Return Reksa Dana</span>
        <span class="stat-value">${((parseFloat(rdMult)-1)*100).toFixed(1)}%</span>
        <span class="stat-sub">per tahun (estimasi)</span>
      </div>
    </div>

    <!-- Price Update -->
    <div class="price-update">
      <span>🔄 <strong>Update Harga Pasar:</strong></span>
      <span>Emas:</span>
      <input type="number" id="inp-gold-price" value="${goldPrice}" style="width:130px;padding:6px 10px;border:2px solid #f39c12;border-radius:8px;font-family:Nunito,sans-serif">
      <span>/gram</span>
      <button class="btn-primary btn-sm" onclick="updateMarketPrice('emas_per_gram',document.getElementById('inp-gold-price').value,'IDR per gram')">Update Emas</button>
      <span style="margin-left:8px">Return RD:</span>
      <input type="number" id="inp-rd-mult" value="${(parseFloat(rdMult)*100).toFixed(1)}" step="0.1" style="width:80px;padding:6px 10px;border:2px solid #f39c12;border-radius:8px;font-family:Nunito,sans-serif">
      <span>% /tahun</span>
      <button class="btn-primary btn-sm" onclick="updateMarketPrice('reksadana_multiplier',1+(document.getElementById('inp-rd-mult').value/100),'annual return rate')">Update RD</button>
    </div>

    <!-- Investment Cards -->
    <div class="inv-grid">
      ${investments.map(inv => renderInvCard(inv)).join('')}
      <!-- Add Card -->
      <div class="inv-card" style="display:flex;align-items:center;justify-content:center;cursor:pointer;border:3px dashed var(--border);background:var(--bg2)" onclick="openModal('modal-inv');updateInvForm()">
        <div style="text-align:center;color:var(--text-muted)">
          <div style="font-size:2.5rem;margin-bottom:8px">➕</div>
          <div style="font-weight:700">Tambah Investasi</div>
        </div>
      </div>
    </div>

    <!-- Tip -->
    <div class="tip-box" style="margin-top:20px">
      <span class="tip-icon">💡</span>
      <span><strong>Tips Aaron:</strong> Harga emas dan return reksa dana adalah ESTIMASI berdasarkan harga pasar. Selalu cek harga terkini di app Antam / Bibit / Bareksa ya! 📱</span>
    </div>
  `;
}

function renderInvCard(inv) {
  const gain = parseFloat(inv.current_value) - parseFloat(inv.purchase_amount);
  const gainPct = parseFloat(inv.growth_pct);
  const isProfit = gain >= 0;
  const barWidth = Math.min(Math.abs(gainPct) * 10, 100);
  
  return `
    <div class="inv-card" style="border-top-color:${inv.color||'#ffd700'}">
      <div class="inv-card-top">
        <span class="inv-icon">${inv.emoji||'📈'}</span>
        <span class="inv-badge">${inv.type.toUpperCase()}</span>
      </div>
      <div class="inv-name">${inv.name}</div>
      <div class="inv-type">${inv.quantity} ${inv.unit} ${inv.notes?'· '+inv.notes:''}</div>
      <div class="inv-row">
        <span class="inv-label">Modal Awal</span>
        <span class="inv-val">${formatRp(inv.purchase_amount)}</span>
      </div>
      <div class="inv-row">
        <span class="inv-label">Nilai Sekarang (est.)</span>
        <span class="inv-val" style="font-size:1rem;font-weight:800">${formatRp(inv.current_value)}</span>
      </div>
      <div class="inv-row">
        <span class="inv-label">Keuntungan</span>
        <span class="inv-val ${isProfit?'profit':'loss'}">${isProfit?'+':''}${formatRp(gain)} (${isProfit?'+':''}${gainPct}%)</span>
      </div>
      <div class="growth-bar">
        <div class="growth-bar-fill" style="width:${barWidth}%;background:${isProfit?'linear-gradient(90deg,#b5ead7,#27ae60)':'linear-gradient(90deg,#ffd1dc,#e74c3c)'}"></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:6px">
        <span style="font-size:0.72rem;color:var(--text-muted)">Beli: ${formatDate(inv.purchase_date)}</span>
        <button class="btn-danger" style="margin-left:auto" onclick="deleteInvestment(${inv.id})">🗑️</button>
      </div>
    </div>`;
}

async function deleteInvestment(id) {
  if (!confirm('Hapus investasi ini?')) return;
  const res = await api('/investments/' + id, 'DELETE');
  if (res.success) { showToast('success', '🗑️ Investasi dihapus!'); renderInvestments(); }
}

// ── BUDGETS ──────────────────────────────────────────────
async function renderBudgets() {
  showLoading();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const res = await api(`/budgets?month=${month}&year=${year}`);
  const budgets = res.success ? res.data : [];
  
  populateBudgetForm();
  
  const totalBudget = budgets.reduce((s,b)=>s+parseFloat(b.amount),0);
  const totalSpent = budgets.reduce((s,b)=>s+parseFloat(b.spent||0),0);
  
  document.getElementById('content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div class="section-title">🎯 Budget ${MONTHS_FULL[month-1]} ${year}</div>
      <button class="btn-primary" onclick="openModal('modal-budget');populateBudgetForm()">+ Set Budget</button>
    </div>

    <div class="stats-grid" style="margin-bottom:24px">
      <div class="stat-card blue"><span class="stat-icon">🎯</span><span class="stat-label">Total Budget</span><span class="stat-value">${formatRp(totalBudget,true)}</span></div>
      <div class="stat-card pink"><span class="stat-icon">💸</span><span class="stat-label">Total Terpakai</span><span class="stat-value">${formatRp(totalSpent,true)}</span></div>
      <div class="stat-card ${totalBudget-totalSpent>=0?'mint':'pink'}"><span class="stat-icon">${totalBudget-totalSpent>=0?'✅':'⚠️'}</span><span class="stat-label">Sisa Budget</span><span class="stat-value">${formatRp(Math.abs(totalBudget-totalSpent),true)}</span></div>
      <div class="stat-card lavender"><span class="stat-icon">📊</span><span class="stat-label">Kategori</span><span class="stat-value">${budgets.length}</span><span class="stat-sub">yang diatur</span></div>
    </div>

    ${budgets.length ? `
      <div class="card">
        ${budgets.map(b => {
          const pct = b.amount > 0 ? Math.min((b.spent/b.amount)*100, 100) : 0;
          const over = b.spent > b.amount;
          const warn = pct > 75;
          return `
            <div class="budget-item">
              <div class="budget-header">
                <span class="budget-name">${b.emoji} ${b.name}</span>
                <div style="display:flex;align-items:center;gap:12px">
                  <span class="budget-amounts">${formatRp(b.spent,true)} / ${formatRp(b.amount,true)}</span>
                  <span style="font-size:0.75rem;font-weight:700;color:${over?'#e74c3c':warn?'#f39c12':'#27ae60'}">${over?'🔴 LEWAT!':warn?'🟡 Hampir':'🟢 Aman'}</span>
                  <button class="btn-danger" onclick="deleteBudget(${b.id})">🗑️</button>
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${over?'over':warn?'warn':'ok'}" style="width:${pct.toFixed(1)}%"></div>
              </div>
              ${over ? `<div style="font-size:0.72rem;color:#e74c3c;margin-top:4px">⚠️ Melebihi budget sebesar ${formatRp(b.spent-b.amount)}</div>` : ''}
            </div>`;
        }).join('')}
      </div>
    ` : `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">🎯</div>
          <div class="empty-state-title">Belum ada budget bulan ini~</div>
          <div class="empty-state-sub">Yuk set budget supaya pengeluaran terkontrol! 💪</div>
          <button class="btn-primary" style="margin-top:16px" onclick="openModal('modal-budget')">+ Set Budget Pertama</button>
        </div>
      </div>
    `}

    <div class="tip-box" style="margin-top:20px">
      <span class="tip-icon">💡</span>
      <span><strong>Aturan 50/30/20:</strong> Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan & investasi. Ayo Aaron! 🌟</span>
    </div>
  `;
}

async function deleteBudget(id) {
  if (!confirm('Hapus budget ini?')) return;
  const res = await api('/budgets/' + id, 'DELETE');
  if (res.success) { showToast('success', '🗑️ Budget dihapus!'); renderBudgets(); }
}

// ── ACCOUNTS ─────────────────────────────────────────────
async function renderAccounts() {
  showLoading();
  const res = await api('/accounts');
  const accs = res.success ? res.data : [];
  const total = accs.reduce((s,a)=>s+parseFloat(a.balance),0);
  
  document.getElementById('content').innerHTML = `
    <div class="section-title">🏦 Rekening & Dompet Aaron</div>

    <div class="stat-card blue" style="margin-bottom:24px;display:inline-flex;gap:16px;padding:20px 28px">
      <span class="stat-icon">💰</span>
      <div>
        <div class="stat-label">Total Aset Likuid</div>
        <div class="stat-value">${formatRp(total)}</div>
      </div>
    </div>

    <div class="acc-grid">
      ${accs.map(a => `
        <div class="acc-card" style="border-color:${a.color}60;background:${a.color}15">
          <div class="acc-emoji">${a.emoji}</div>
          <div class="acc-name">${a.name}</div>
          <div class="acc-type">${a.type}</div>
          <div class="acc-balance">${formatRp(a.balance)}</div>
          <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
            <button class="btn-blue btn-sm" onclick="promptUpdateBalance(${a.id},'${a.name}',${a.balance})">✏️ Update Saldo</button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="tip-box" style="margin-top:24px">
      <span class="tip-icon">💡</span>
      <span>Update saldo rekening secara manual sesuai kondisi aktual ya Aaron~ 🏦</span>
    </div>
  `;
}

async function promptUpdateBalance(id, name, current) {
  const val = prompt(`Update saldo ${name}:\nSaldo sekarang: ${formatRp(current)}\n\nMasukkan saldo baru (Rp):`, current);
  if (val === null) return;
  const amount = parseFloat(val);
  if (isNaN(amount)) { showToast('error', '❌ Angka tidak valid!'); return; }
  const res = await api('/accounts/' + id, 'PUT', { balance: amount });
  if (res.success) { showToast('success', '✅ Saldo diperbarui!'); renderAccounts(); }
}

// ── NOTES ────────────────────────────────────────────────
async function renderNotes() {
  showLoading();
  const res = await api('/notes');
  const notes = res.success ? res.data : [];
  
  document.getElementById('content').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div class="section-title">📝 Catatan Aaron</div>
      <button class="btn-primary" onclick="openModal('modal-note')">+ Tambah Catatan</button>
    </div>

    ${notes.length ? `
      <div class="notes-grid">
        ${notes.map(n => `
          <div class="note-card" style="background:${n.color};color:#5a3d5c">
            <button class="note-delete" onclick="deleteNote(${n.id})">✕</button>
            <div class="note-emoji">${n.emoji||'📝'}</div>
            <div class="note-title">${n.title||''}</div>
            <div class="note-content">${n.content||''}</div>
            <div style="font-size:0.7rem;opacity:0.6;margin-top:12px">${formatDate(n.created_at)}</div>
          </div>
        `).join('')}
        <!-- Add Note Card -->
        <div class="note-card" style="background:var(--bg);border:3px dashed var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="openModal('modal-note')">
          <div style="text-align:center;color:var(--text-muted)">
            <div style="font-size:2rem;margin-bottom:8px">📝</div>
            <div style="font-weight:700">Tambah Catatan</div>
          </div>
        </div>
      </div>
    ` : `
      <div class="card">
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">Belum ada catatan~</div>
          <div class="empty-state-sub">Tulis target keuangan atau pengingat pentingmu!</div>
          <button class="btn-primary" style="margin-top:16px" onclick="openModal('modal-note')">+ Catatan Pertama</button>
        </div>
      </div>
    `}
  `;
}
