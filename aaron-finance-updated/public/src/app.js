/* ============================================================
   🎀 Aaron Finance — Core App Logic
   ============================================================ */

const API = '/api';
let currentPage = 'dashboard';
let categories = { pengeluaran: [], pemasukan: [] };
let accounts = [];

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set date
  const now = new Date();
  document.getElementById('current-date').textContent = 
    now.toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  
  // Load initial data
  loadCategoriesAndAccounts().then(() => navigate('dashboard'));
  
  // Set today as default in txn form
  document.getElementById('txn-date').value = now.toISOString().split('T')[0];
  document.getElementById('inv-date').value = now.toISOString().split('T')[0];
  
  // Set current month in budget form
  document.getElementById('budget-month').value = now.getMonth() + 1;
  document.getElementById('budget-year').value = now.getFullYear();
});

// ── NAVIGATION ────────────────────────────────────────────
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const titles = {
    dashboard: '🏠 Dashboard',
    transactions: '📋 Transaksi',
    analytics: '📊 Analitik',
    investments: '💰 Investasi',
    budgets: '🎯 Budget',
    accounts: '🏦 Rekening',
    notes: '📝 Catatan'
  };
  document.getElementById('page-title').textContent = titles[page] || page;
  
  const pages = { dashboard: renderDashboard, transactions: renderTransactions, 
    analytics: renderAnalytics, investments: renderInvestments,
    budgets: renderBudgets, accounts: renderAccounts, notes: renderNotes };
  
  if (pages[page]) pages[page]();
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── DATA FETCHING ─────────────────────────────────────────
async function api(endpoint, method='GET', body=null) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + endpoint, opts);
    return await res.json();
  } catch (e) {
    console.error('API error:', e);
    return { success: false, error: e.message };
  }
}

async function loadCategoriesAndAccounts() {
  const [cats, accs] = await Promise.all([api('/categories'), api('/accounts')]);
  if (cats.success) {
    categories.pengeluaran = cats.data.filter(c => c.type === 'pengeluaran');
    categories.pemasukan = cats.data.filter(c => c.type === 'pemasukan');
  }
  if (accs.success) accounts = accs.data;
  populateTxnForm();
}

function populateTxnForm() {
  const catSel = document.getElementById('txn-category');
  const accSel = document.getElementById('txn-account');
  const type = document.getElementById('txn-type').value;
  
  const cats = type === 'pengeluaran' ? categories.pengeluaran : categories.pemasukan;
  catSel.innerHTML = cats.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  accSel.innerHTML = accounts.map(a => `<option value="${a.id}">${a.emoji} ${a.name}</option>`).join('');
  
  // Toggle tipe field
  document.getElementById('tipe-group').style.display = type === 'pengeluaran' ? 'block' : 'none';
}

// ── MODALS ────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }

function setTxnType(type, btn) {
  document.getElementById('txn-type').value = type;
  document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  populateTxnForm();
}

// ── TRANSACTIONS ─────────────────────────────────────────
async function submitTransaction(e) {
  e.preventDefault();
  const id = document.getElementById('txn-id').value;
  const body = {
    account_id: parseInt(document.getElementById('txn-account').value),
    category_id: parseInt(document.getElementById('txn-category').value),
    type: document.getElementById('txn-type').value,
    tipe_pengeluaran: document.getElementById('txn-type').value === 'pengeluaran' 
      ? document.getElementById('txn-tipe').value : null,
    amount: parseFloat(document.getElementById('txn-amount').value),
    description: document.getElementById('txn-desc').value,
    date: document.getElementById('txn-date').value,
    is_flagged: document.getElementById('txn-flagged').checked,
    notes: document.getElementById('txn-notes').value
  };
  
  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `/transactions/${id}` : '/transactions';
  const res = await api(endpoint, method, body);
  
  if (res.success) {
    closeModal('modal-txn');
    showToast('success', id ? '✅ Transaksi diperbarui!' : '🎉 Transaksi berhasil ditambahkan!');
    resetTxnForm();
    navigate(currentPage);
  } else {
    showToast('error', '❌ Gagal: ' + res.error);
  }
}

function resetTxnForm() {
  document.getElementById('txn-id').value = '';
  document.getElementById('form-txn').reset();
  document.getElementById('txn-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('txn-type').value = 'pengeluaran';
  document.querySelectorAll('.form-tab')[0].classList.add('active');
  document.querySelectorAll('.form-tab')[1].classList.remove('active');
  populateTxnForm();
}

async function deleteTransaction(id) {
  if (!confirm('Hapus transaksi ini? 🗑️')) return;
  const res = await api('/transactions/' + id, 'DELETE');
  if (res.success) { showToast('success', '🗑️ Transaksi dihapus!'); navigate(currentPage); }
}

function editTransaction(txn) {
  document.getElementById('txn-id').value = txn.id;
  setTxnType(txn.type, document.querySelectorAll('.form-tab')[txn.type === 'pengeluaran' ? 0 : 1]);
  document.getElementById('txn-amount').value = txn.amount;
  document.getElementById('txn-date').value = txn.date?.split('T')[0] || txn.date;
  document.getElementById('txn-desc').value = txn.description || '';
  document.getElementById('txn-flagged').checked = txn.is_flagged;
  document.getElementById('txn-notes').value = txn.notes || '';
  if (txn.tipe_pengeluaran) document.getElementById('txn-tipe').value = txn.tipe_pengeluaran;
  setTimeout(() => {
    document.getElementById('txn-category').value = txn.category_id;
    document.getElementById('txn-account').value = txn.account_id;
  }, 100);
  openModal('modal-txn');
}

// ── INVESTMENTS ───────────────────────────────────────────
function updateInvForm() {
  const type = document.getElementById('inv-type').value;
  const showQty = ['emas','saham','kripto'].includes(type);
  document.getElementById('inv-qty-group').style.display = showQty ? 'block' : 'none';
  document.getElementById('inv-unit-group').style.display = showQty ? 'block' : 'none';
}

async function submitInvestment(e) {
  e.preventDefault();
  const body = {
    name: document.getElementById('inv-name').value,
    type: document.getElementById('inv-type').value,
    purchase_amount: parseFloat(document.getElementById('inv-amount').value),
    purchase_date: document.getElementById('inv-date').value,
    quantity: parseFloat(document.getElementById('inv-qty').value) || 1,
    unit: document.getElementById('inv-unit').value,
    notes: document.getElementById('inv-notes').value,
    emoji: getInvEmoji(document.getElementById('inv-type').value),
    color: getInvColor(document.getElementById('inv-type').value)
  };
  const res = await api('/investments', 'POST', body);
  if (res.success) {
    closeModal('modal-inv'); showToast('success', '💰 Investasi berhasil ditambahkan!');
    navigate('investments');
  } else { showToast('error', '❌ Gagal: ' + res.error); }
}

function getInvEmoji(type) {
  return { emas:'🥇', reksadana:'📊', saham:'📈', kripto:'🪙', lain:'💼' }[type] || '📈';
}
function getInvColor(type) {
  return { emas:'#FFD700', reksadana:'#b5ead7', saham:'#a8d8ea', kripto:'#c7ceea', lain:'#ffd1dc' }[type] || '#a8d8ea';
}

// ── BUDGETS ───────────────────────────────────────────────
async function submitBudget(e) {
  e.preventDefault();
  const body = {
    category_id: parseInt(document.getElementById('budget-category').value),
    amount: parseFloat(document.getElementById('budget-amount').value),
    month: parseInt(document.getElementById('budget-month').value),
    year: parseInt(document.getElementById('budget-year').value)
  };
  const res = await api('/budgets', 'POST', body);
  if (res.success) {
    closeModal('modal-budget'); showToast('success', '🎯 Budget berhasil disimpan!');
    navigate('budgets');
  } else { showToast('error', '❌ Gagal: ' + res.error); }
}

function populateBudgetForm() {
  const sel = document.getElementById('budget-category');
  sel.innerHTML = categories.pengeluaran.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
}

// ── NOTES ─────────────────────────────────────────────────
async function submitNote(e) {
  e.preventDefault();
  const body = {
    title: document.getElementById('note-title').value,
    content: document.getElementById('note-content').value,
    emoji: document.getElementById('note-emoji').value,
    color: document.getElementById('note-color').value
  };
  const res = await api('/notes', 'POST', body);
  if (res.success) {
    closeModal('modal-note'); showToast('success', '📝 Catatan disimpan!');
    navigate('notes');
  } else { showToast('error', '❌ Gagal: ' + res.error); }
}

async function deleteNote(id) {
  if (!confirm('Hapus catatan ini? 🗑️')) return;
  const res = await api('/notes/' + id, 'DELETE');
  if (res.success) { showToast('success', '🗑️ Catatan dihapus!'); navigate('notes'); }
}

// ── UTILS ─────────────────────────────────────────────────
function formatRp(amount, compact=false) {
  if (compact && Math.abs(amount) >= 1000000) {
    return 'Rp' + (amount / 1000000).toFixed(1) + 'jt';
  } else if (compact && Math.abs(amount) >= 1000) {
    return 'Rp' + (amount / 1000).toFixed(0) + 'rb';
  }
  return 'Rp' + Math.abs(amount).toLocaleString('id-ID');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function showLoading() {
  document.getElementById('content').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div>Memuat data... 🌸</div>
    </div>`;
}

function showToast(type, msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Market price update
async function updateMarketPrice(assetType, price, unit) {
  const res = await api('/market-prices', 'PUT', { asset_type: assetType, price_per_unit: price, unit });
  if (res.success) { showToast('success', '📈 Harga pasar diperbarui!'); navigate('investments'); }
  else showToast('error', '❌ Gagal memperbarui harga');
}
