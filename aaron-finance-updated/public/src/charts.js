/* ============================================================
   🎀 Aaron Finance — Chart.js Renderers
   ============================================================ */

const PASTEL_COLORS = [
  '#ffb7c5','#a8d8ea','#b5ead7','#ffeaa7','#c7ceea',
  '#ffd1dc','#d6eaf8','#d5f5e3','#fef9e7','#e8daef',
  '#fadbd8','#d6eaf8','#d5f5e3','#fde8d8'
];

function chartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: 'Nunito', weight: '700', size: 12 }, color: '#9b7ea0' } },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        titleColor: '#5a3d5c',
        bodyColor: '#9b7ea0',
        borderColor: '#f0dde8',
        borderWidth: 2,
        padding: 12,
        titleFont: { family: 'Fredoka One', size: 14 },
        bodyFont: { family: 'Nunito', size: 12 },
        callbacks: {
          label: ctx => ` ${ctx.dataset.label || ''}: Rp${Math.abs(ctx.raw).toLocaleString('id-ID')}`
        }
      }
    }
  };
}

// Monthly Bar Chart (Dashboard)
function renderMonthlyChart(canvasId, monthly) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !monthly.length) return;
  Chart.getChart(ctx)?.destroy();
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthly.map(m => MONTHS[m.month-1] + ' ' + m.year),
      datasets: [
        {
          label: '💰 Pemasukan',
          data: monthly.map(m => parseFloat(m.pemasukan)),
          backgroundColor: 'rgba(168,216,234,0.7)',
          borderColor: '#5dade2',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: '💸 Pengeluaran',
          data: monthly.map(m => parseFloat(m.pengeluaran)),
          backgroundColor: 'rgba(255,183,197,0.7)',
          borderColor: '#f48fb1',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    },
    options: {
      ...chartDefaults(),
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0' } },
        y: { grid: { color: '#f0dde8' }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0',
          callback: v => 'Rp' + (v >= 1000000 ? (v/1000000).toFixed(1)+'jt' : v >= 1000 ? (v/1000).toFixed(0)+'rb' : v)
        }}
      }
    }
  });
}

// Donut Chart (Dashboard)
function renderDonutChart(canvasId, categories) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || !categories.length) return;
  Chart.getChart(ctx)?.destroy();
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.emoji + ' ' + c.name),
      datasets: [{
        data: categories.map(c => parseFloat(c.total)),
        backgroundColor: categories.map((c,i) => c.color || PASTEL_COLORS[i % PASTEL_COLORS.length]),
        borderWidth: 3,
        borderColor: '#fff',
        hoverBorderColor: '#fff',
        hoverOffset: 8,
      }]
    },
    options: {
      ...chartDefaults(),
      cutout: '62%',
      plugins: {
        ...chartDefaults().plugins,
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.label}: Rp${ctx.raw.toLocaleString('id-ID')}`
          }
        }
      }
    }
  });
}

// Analytics Bar Chart
function renderBarChart(canvasId, monthly) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  Chart.getChart(ctx)?.destroy();
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthly.map(m => MONTHS_FULL[m.month-1]),
      datasets: [
        {
          label: '💰 Pemasukan',
          data: monthly.map(m => parseFloat(m.pemasukan)),
          backgroundColor: 'rgba(168,216,234,0.75)',
          borderColor: '#5dade2',
          borderWidth: 2,
          borderRadius: 10,
        },
        {
          label: '💸 Pengeluaran',
          data: monthly.map(m => parseFloat(m.pengeluaran)),
          backgroundColor: 'rgba(255,183,197,0.75)',
          borderColor: '#f48fb1',
          borderWidth: 2,
          borderRadius: 10,
        }
      ]
    },
    options: {
      ...chartDefaults(),
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0' } },
        y: { grid: { color: '#f0dde8' }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0',
          callback: v => 'Rp' + (v >= 1000000 ? (v/1000000).toFixed(1)+'jt' : v >= 1000 ? (v/1000).toFixed(0)+'rb' : v)
        }}
      }
    }
  });
}

// Category bar chart (Analytics)
function renderCategoryChart(canvasId, categories) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  Chart.getChart(ctx)?.destroy();
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories.map(c => c.emoji + ' ' + c.name),
      datasets: [{
        label: 'Total Pengeluaran',
        data: categories.map(c => parseFloat(c.total)),
        backgroundColor: categories.map((c,i) => c.color || PASTEL_COLORS[i % PASTEL_COLORS.length]),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        borderRadius: 8,
      }]
    },
    options: {
      ...chartDefaults(),
      indexAxis: 'y',
      scales: {
        x: { grid: { color: '#f0dde8' }, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0',
          callback: v => 'Rp' + (v >= 1000000 ? (v/1000000).toFixed(1)+'jt' : v >= 1000 ? (v/1000).toFixed(0)+'rb' : v)
        }},
        y: { grid: { display: false }, ticks: { font: { family: 'Nunito', weight: '700', size: 11 }, color: '#9b7ea0' } }
      },
      plugins: {
        ...chartDefaults().plugins,
        legend: { display: false }
      }
    }
  });
}

// Needs vs Wants stacked chart
function renderNeedsWantsChart(canvasId, monthly, byType) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  Chart.getChart(ctx)?.destroy();
  
  // This is a placeholder — in real app, needs/wants would be per month
  const kebutuhan = byType.find(t=>t.tipe_pengeluaran==='kebutuhan')?.total || 0;
  const keinginan = byType.find(t=>t.tipe_pengeluaran==='keinginan')?.total || 0;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total 2026'],
      datasets: [
        {
          label: '✅ Kebutuhan',
          data: [parseFloat(kebutuhan)],
          backgroundColor: 'rgba(168,216,234,0.75)',
          borderColor: '#5dade2',
          borderWidth: 2,
          borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 8, bottomRight: 8 },
          stack: 'combined',
        },
        {
          label: '🛍️ Keinginan',
          data: [parseFloat(keinginan)],
          backgroundColor: 'rgba(255,183,197,0.75)',
          borderColor: '#f48fb1',
          borderWidth: 2,
          borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
          stack: 'combined',
        }
      ]
    },
    options: {
      ...chartDefaults(),
      scales: {
        x: { grid: { display: false }, stacked: true, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0' } },
        y: { grid: { color: '#f0dde8' }, stacked: true, ticks: { font: { family: 'Nunito', weight: '700' }, color: '#9b7ea0',
          callback: v => 'Rp' + (v >= 1000000 ? (v/1000000).toFixed(1)+'jt' : v >= 1000 ? (v/1000).toFixed(0)+'rb' : v)
        }}
      }
    }
  });
}
