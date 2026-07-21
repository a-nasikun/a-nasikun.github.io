'use strict';

/* ================================================================
   Rendering: tabel data, KPI, dan tiga chart (Chart.js) dari js/data.js.
   Satu sumber data (PROGRAMS / DEPARTMENT_DATA / FACULTY_TOTAL) dipakai
   ulang di sini supaya tabel dan grafik tidak pernah berbeda angka.
   ================================================================ */

const css = getComputedStyle(document.documentElement);
const cvar = name => css.getPropertyValue(name).trim();

const COLORS = {
  navy: cvar('--navy'),
  gold: cvar('--gold'),
  ink: cvar('--ink-primary'),
  inkSecondary: cvar('--ink-secondary'),
  inkMuted: cvar('--ink-muted'),
  grid: cvar('--grid-line'),
  good: cvar('--status-good'),
  critical: cvar('--status-critical'),
  years: {
    2023: cvar('--yr-2023'),
    2024: cvar('--yr-2024'),
    2025: cvar('--yr-2025'),
    2026: cvar('--yr-2026'),
  },
};

function delta(from, to) {
  const abs = to - from;
  const pct = from === 0 ? 0 : (abs / from) * 100;
  return { abs, pct };
}

function deltaBadgeHTML(from, to) {
  const { abs, pct } = delta(from, to);
  if (abs === 0) return `<span class="delta-badge flat">→ 0%</span>`;
  const dir = abs > 0 ? 'up' : 'down';
  const arrow = abs > 0 ? '▲' : '▼';
  return `<span class="delta-badge ${dir}">${arrow} ${Math.abs(pct).toFixed(1)}%</span>`;
}

/* ── Hero stats ────────────────────────────────────────────────── */
(function renderHeroStats() {
  const total2026 = FACULTY_TOTAL[FACULTY_TOTAL.length - 1];
  const total2023 = FACULTY_TOTAL[0];
  const { pct } = delta(total2023, total2026);
  document.getElementById('stat-total-2026').textContent = total2026.toLocaleString('id-ID');
  const deltaEl = document.getElementById('stat-delta-2326');
  deltaEl.textContent = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  deltaEl.classList.add(pct >= 0 ? 'delta-up' : 'delta-down');
})();

/* ── Data table ────────────────────────────────────────────────── */
(function renderTable() {
  const tbody = document.getElementById('table-body');
  const rows = PROGRAMS.map(p => {
    const [y23, y24, y25, y26] = p.values;
    return `
      <tr>
        <td><span class="prog-name">${p.name}</span><span class="dept-tag">${p.dept}</span></td>
        <td class="num">${y23.toLocaleString('id-ID')}</td>
        <td class="num">${y24.toLocaleString('id-ID')}</td>
        <td class="num">${y25.toLocaleString('id-ID')}</td>
        <td class="num">${y26.toLocaleString('id-ID')}</td>
        <td>${deltaBadgeHTML(y23, y26)}</td>
      </tr>`;
  }).join('');
  tbody.innerHTML = rows;

  const tfoot = document.getElementById('table-foot');
  const [t23, t24, t25, t26] = FACULTY_TOTAL;
  tfoot.innerHTML = `
    <tr>
      <td>Total Fakultas Teknik</td>
      <td class="num">${t23.toLocaleString('id-ID')}</td>
      <td class="num">${t24.toLocaleString('id-ID')}</td>
      <td class="num">${t25.toLocaleString('id-ID')}</td>
      <td class="num">${t26.toLocaleString('id-ID')}</td>
      <td>${deltaBadgeHTML(t23, t26)}</td>
    </tr>`;
})();

/* ── Chart.js global defaults ──────────────────────────────────── */
Chart.defaults.font.family = "'IBM Plex Sans', system-ui, sans-serif";
Chart.defaults.color = COLORS.inkSecondary;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.tooltip.backgroundColor = COLORS.navy;
Chart.defaults.plugins.tooltip.titleFont = { family: "'IBM Plex Mono', monospace", size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { family: "'IBM Plex Sans', system-ui, sans-serif", size: 13, weight: '600' };
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.plugins.tooltip.boxPadding = 4;

/* ── 1. Tren total mahasiswa FT UGM per tahun (satu seri) ────────── */
(function renderTotalTrend() {
  const ctx = document.getElementById('chart-total').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: YEARS,
      datasets: [{
        label: 'Total mahasiswa terdaftar',
        data: FACULTY_TOTAL,
        borderColor: COLORS.gold,
        backgroundColor: 'rgba(201,168,76,0.12)',
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: COLORS.navy,
        pointBorderColor: COLORS.gold,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.25,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => `Tahun ${items[0].label}`,
            label: item => `${item.parsed.y.toLocaleString('id-ID')} mahasiswa`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "'IBM Plex Mono', monospace" } } },
        y: {
          beginAtZero: false,
          suggestedMin: 1300,
          grid: { color: COLORS.grid, drawTicks: false },
          border: { display: false },
          ticks: { callback: v => v.toLocaleString('id-ID') },
        },
      },
    },
  });
})();

/* ── Shared dataset builder: satu dataset per tahun, warna kategorikal tetap ── */
function yearDatasets(getValues) {
  return YEARS.map(y => ({
    label: String(y),
    data: getValues(y),
    backgroundColor: COLORS.years[y],
    borderRadius: 4,
    borderSkipped: 'start',
    maxBarThickness: 22,
    categoryPercentage: 0.8,
    barPercentage: 0.9,
  }));
}

const barTooltipOptions = {
  callbacks: {
    title: items => items[0].label,
    label: item => ` ${item.dataset.label}: ${item.parsed.x.toLocaleString('id-ID')} mahasiswa`,
  },
};

/* ── 2. Pertumbuhan per program studi (15 prodi, horizontal grouped bar) ── */
(function renderProgramsChart() {
  const sorted = [...PROGRAMS].sort((a, b) => b.values[3] - a.values[3]);
  const ctx = document.getElementById('chart-programs').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(p => p.name),
      datasets: yearDatasets(y => sorted.map(p => p.values[YEARS.indexOf(y)])),
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'start', labels: { boxWidth: 12, boxHeight: 12, padding: 16 } },
        tooltip: barTooltipOptions,
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: COLORS.grid, drawTicks: false },
          border: { display: false },
          ticks: { callback: v => v.toLocaleString('id-ID') },
        },
        y: { grid: { display: false }, border: { display: false } },
      },
    },
  });
})();

/* ── 3. Pertumbuhan per departemen (8 departemen, vertical grouped bar) ── */
(function renderDepartmentsChart() {
  const sorted = [...DEPARTMENT_DATA].sort((a, b) => b.values[3] - a.values[3]);
  const ctx = document.getElementById('chart-departments').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d.code),
      datasets: yearDatasets(y => sorted.map(d => d.values[YEARS.indexOf(y)])),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'start', labels: { boxWidth: 12, boxHeight: 12, padding: 16 } },
        tooltip: {
          callbacks: {
            title: items => {
              const d = sorted[items[0].dataIndex];
              return `${d.code} — ${d.name}`;
            },
            label: item => ` ${item.dataset.label}: ${item.parsed.y.toLocaleString('id-ID')} mahasiswa`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: COLORS.grid, drawTicks: false },
          border: { display: false },
          ticks: { callback: v => v.toLocaleString('id-ID') },
        },
      },
    },
  });
})();

/* ── Department cards grid ────────────────────────────────────── */
(function renderDeptCards() {
  const grid = document.getElementById('dept-grid');
  grid.innerHTML = DEPARTMENT_DATA.map(d => {
    const [y23, , , y26] = d.values;
    return `
      <div class="dept-card">
        <span class="dept-code">${d.code}</span>
        <h4>${d.name}</h4>
        <p>${d.composition}</p>
        <div class="dept-nums">
          <span>2023: <span class="n">${y23}</span> → 2026: <span class="n">${y26}</span></span>
          ${deltaBadgeHTML(y23, y26)}
        </div>
      </div>`;
  }).join('');
})();
