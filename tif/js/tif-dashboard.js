/* ================================================================
   TIF UGM — Dasbor Mahasiswa
   Data: tif/processed/students.json (agregat, tanpa NIM/nama/kontak)
   Grafik: Apache ECharts (dimuat via CDN di index.html)
   ================================================================ */
'use strict';

// ── Tokens (mirrors css/tif.css) ──────────────────────────────────
const NAVY        = '#0d1b2a';
const NAVY_MID     = '#1a2e45';
const GOLD         = '#c9a84c';
const GRAY_600     = '#5a5a52';
const GRAY_400     = '#9a9a90';
const GRAY_200     = '#e8e8e2';
const CRITICAL     = '#d03b3b';
const FONT_SANS    = "'IBM Plex Sans', system-ui, sans-serif";
const FONT_MONO    = "'IBM Plex Mono', monospace";
const FONT_SERIF   = "'Lora', Georgia, serif";

const JALUR_ORDER  = ['SNBP', 'SNBT', 'UM UGM', 'IUP'];
const JALUR_COLORS = { SNBP: '#2f6fb5', SNBT: '#1baf7a', 'UM UGM': '#b5457a', IUP: '#c9a84c' };
const REGIUP_COLORS = { Reguler: '#2f6fb5', IUP: '#c9a84c' };
const GENDER_COLORS = { L: '#1a2e45', P: '#b5657a' };
const GENDER_LABELS = { L: 'Laki-laki', P: 'Perempuan' };
const BLOOD_ORDER   = ['A', 'B', 'AB', 'O'];
const BLOOD_COLORS  = { A: '#2f6fb5', B: '#b5457a', AB: '#c9772e', O: '#1baf7a' };
const STATUS_ORDER  = ['REGISTRASI', 'AKTIF', 'KAMPUS MERDEKA', 'CUTI DENGAN IJIN', 'LULUS', 'NON AKTIF', 'MENGUNDURKAN DIRI'];

const fmt   = n => n.toLocaleString('id-ID');
const fmt2  = n => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct   = (n, d) => d === 0 ? '–' : `${((n / d) * 100).toFixed(1)}%`;

function baseTextStyle() { return { fontFamily: FONT_SANS, color: GRAY_600, fontSize: 12 }; }

// ── State ──────────────────────────────────────────────────────────
const STATE = { raw: [], year: 'all' };
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

function filtered() {
  if (STATE.year === 'all') return STATE.raw;
  return STATE.raw.filter(r => String(r.source_year) === String(STATE.year));
}

// ── Small stats helpers ───────────────────────────────────────────
function mean(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
function stdev(values) {
  if (values.length < 2) return 0;
  const m = mean(values);
  const v = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}
function groupBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  }
  return map;
}
function countBy(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k === null || k === undefined) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

// ── Gaussian KDE, scaled to an approximate "Jumlah" (count) y-axis ──
// Silverman's rule-of-thumb bandwidth. Evaluated on a fixed 0–4 grid
// (the IPK scale) so multiple groups can be overlaid on shared axes.
function kde(values, { min = 0, max = 4, points = 161 } = {}) {
  const n = values.length;
  if (n === 0) return [];
  const std = stdev(values) || 0.15;
  const h = Math.max(0.9 * std * Math.pow(n, -1 / 5), 0.06);
  const step = (max - min) / (points - 1);
  const out = [];
  for (let i = 0; i < points; i++) {
    const x = min + i * step;
    let sum = 0;
    for (const v of values) {
      const u = (x - v) / h;
      sum += Math.exp(-0.5 * u * u);
    }
    const density = sum / (n * h * Math.sqrt(2 * Math.PI));
    out.push([Number(x.toFixed(3)), Number((density * n * step).toFixed(4))]);
  }
  return out;
}

// ── ECharts instance cache + responsive resize ────────────────────
const CHARTS = {};
function getChart(elId) {
  if (!CHARTS[elId]) {
    const el = document.getElementById(elId);
    CHARTS[elId] = echarts.init(el);
  }
  return CHARTS[elId];
}
window.addEventListener('resize', () => {
  Object.values(CHARTS).forEach(c => c.resize());
});

function showEmpty(elId, message) {
  const el = document.getElementById(elId);
  if (CHARTS[elId]) { CHARTS[elId].dispose(); delete CHARTS[elId]; }
  el.innerHTML = `<div class="tif-empty-state">${message}</div>`;
}
function clearEmpty(elId) {
  const el = document.getElementById(elId);
  if (el.querySelector('.tif-empty-state')) el.innerHTML = '';
}

// ================================================================
// Charts that DO respect the global year filter
// ================================================================

function renderDistChart(elId, groups, colorMap, { unit = 'IPK' } = {}) {
  const usable = groups.filter(g => g.values.length >= 3);
  const excluded = groups.filter(g => g.values.length > 0 && g.values.length < 3);

  if (usable.length === 0) {
    showEmpty(elId, 'Data tidak cukup untuk digambar pada pilihan tahun ini.');
    return;
  }
  clearEmpty(elId);
  const chart = getChart(elId);
  const series = usable.map(g => ({
    name: g.name,
    type: 'line',
    smooth: true,
    symbol: 'none',
    lineStyle: { width: 2.5, color: colorMap[g.name] },
    areaStyle: { color: colorMap[g.name], opacity: 0.12 },
    emphasis: { focus: 'series' },
    data: kde(g.values),
  }));
  chart.setOption({
    textStyle: baseTextStyle(),
    color: usable.map(g => colorMap[g.name]),
    grid: { left: 46, right: 20, top: 12, bottom: 58 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: v => fmt(Math.round(v)),
      textStyle: { fontFamily: FONT_SANS, fontSize: 12 },
    },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: FONT_SANS, fontSize: 11, color: GRAY_600 },
      data: usable.map(g => ({ name: g.name, itemStyle: { color: colorMap[g.name] } })),
    },
    xAxis: {
      type: 'value', min: 0, max: 4, name: unit, nameLocation: 'middle', nameGap: 26,
      nameTextStyle: { fontFamily: FONT_MONO, fontSize: 11, color: GRAY_400 },
      axisLabel: { fontFamily: FONT_MONO, fontSize: 11 },
      axisLine: { lineStyle: { color: GRAY_200 } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value', name: 'Jumlah (estimasi)',
      nameTextStyle: { fontFamily: FONT_MONO, fontSize: 10, color: GRAY_400 },
      axisLabel: { fontFamily: FONT_MONO, fontSize: 11 },
      splitLine: { lineStyle: { color: GRAY_200 } },
    },
  }, true);

  const noteEl = document.getElementById(`${elId}-note`);
  if (noteEl) {
    noteEl.textContent = excluded.length
      ? `Tidak digambar (n terlalu kecil): ${excluded.map(g => `${g.name} (n=${g.values.length})`).join(', ')}.`
      : '';
  }
}

function renderIpkByJalur() {
  const rows = filtered().filter(r => r.ipk != null);
  const groups = JALUR_ORDER.map(name => ({
    name, values: rows.filter(r => r.jalur_masuk === name).map(r => r.ipk),
  }));
  renderDistChart('chart-ipk-jalur', groups, JALUR_COLORS);
}

function renderIpkRegIup() {
  const rows = filtered().filter(r => r.ipk != null);
  const groups = ['Reguler', 'IUP'].map(name => ({
    name, values: rows.filter(r => r.sub_angkatan === name).map(r => r.ipk),
  }));
  renderDistChart('chart-ipk-regiup', groups, REGIUP_COLORS);
}

function renderIpkGender() {
  const rows = filtered().filter(r => r.ipk != null);
  const groups = ['L', 'P'].map(code => ({
    name: GENDER_LABELS[code], values: rows.filter(r => r.jenis_kelamin === code).map(r => r.ipk),
  }));
  const colorMap = { [GENDER_LABELS.L]: GENDER_COLORS.L, [GENDER_LABELS.P]: GENDER_COLORS.P };
  renderDistChart('chart-ipk-gender', groups, colorMap);
}

function renderGenderDonut() {
  const rows = filtered();
  const counts = countBy(rows, r => r.jenis_kelamin);
  const total = rows.length;
  clearEmpty('chart-gender');
  const chart = getChart('chart-gender');
  chart.setOption({
    textStyle: baseTextStyle(),
    color: ['L', 'P'].map(k => GENDER_COLORS[k]),
    tooltip: { trigger: 'item', formatter: p => `${p.name}: ${fmt(p.value)} (${p.percent}%)` },
    legend: { bottom: 0, textStyle: { fontFamily: FONT_SANS, fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { formatter: '{b}\n{d}%', fontFamily: FONT_SANS, fontSize: 11, color: GRAY_600 },
      data: ['L', 'P'].map(k => ({ name: GENDER_LABELS[k], value: counts.get(k) || 0 })),
    }],
    graphic: {
      elements: [{
        type: 'text', left: 'center', top: 'center',
        style: { text: fmt(total), fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, fill: NAVY },
      }],
    },
  }, true);
}

function renderBloodDonut() {
  const rows = filtered();
  const withBlood = rows.filter(r => r.golongan_darah);
  const missing = rows.length - withBlood.length;
  const counts = countBy(withBlood, r => r.golongan_darah);
  clearEmpty('chart-blood');
  const chart = getChart('chart-blood');
  chart.setOption({
    textStyle: baseTextStyle(),
    color: BLOOD_ORDER.map(k => BLOOD_COLORS[k]),
    tooltip: { trigger: 'item', formatter: p => `Gol. ${p.name}: ${fmt(p.value)} (${p.percent}%)` },
    legend: { bottom: 0, textStyle: { fontFamily: FONT_SANS, fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      itemStyle: { borderColor: '#fff', borderWidth: 2 },
      label: { formatter: '{b}\n{d}%', fontFamily: FONT_SANS, fontSize: 11, color: GRAY_600 },
      data: BLOOD_ORDER.map(k => ({ name: k, value: counts.get(k) || 0 })),
    }],
    graphic: {
      elements: [{
        type: 'text', left: 'center', top: 'center',
        style: { text: fmt(withBlood.length), fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, fill: NAVY },
      }],
    },
  }, true);
  const noteEl = document.getElementById('chart-blood-note');
  if (noteEl) noteEl.textContent = missing ? `${fmt(missing)} data golongan darah tidak lengkap, dikecualikan.` : '';
}

function renderHorizontalBar(elId, counts, { color = '#2f6fb5', top = null, formatterUnit = '' } = {}) {
  let entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (top) entries = entries.slice(0, top);
  if (entries.length === 0) {
    showEmpty(elId, 'Tidak ada data pada pilihan tahun ini.');
    return;
  }
  clearEmpty(elId);
  entries.reverse();
  const chart = getChart(elId);
  chart.setOption({
    textStyle: baseTextStyle(),
    grid: { left: 8, right: 50, top: 8, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => fmt(v) + formatterUnit },
    xAxis: { type: 'value', axisLabel: { fontFamily: FONT_MONO, fontSize: 10 }, splitLine: { lineStyle: { color: GRAY_200 } } },
    yAxis: {
      type: 'category', data: entries.map(e => e[0]), inverse: false,
      axisLabel: { fontFamily: FONT_SANS, fontSize: 11, color: GRAY_600 },
      axisLine: { lineStyle: { color: GRAY_200 } },
    },
    series: [{
      type: 'bar',
      data: entries.map(e => e[1]),
      itemStyle: { color, borderRadius: [0, 4, 4, 0] },
      barMaxWidth: 22,
      label: { show: true, position: 'right', formatter: p => fmt(p.value), fontFamily: FONT_MONO, fontSize: 10, color: GRAY_600 },
    }],
  }, true);
}

function renderAgama() {
  renderHorizontalBar('chart-agama', countBy(filtered(), r => r.agama), { color: '#2f6fb5' });
}
function renderPekerjaan() {
  renderHorizontalBar('chart-pekerjaan', countBy(filtered(), r => r.pekerjaan_kategori), { color: '#2f6fb5' });
}
function renderPropinsi() {
  renderHorizontalBar('chart-propinsi', countBy(filtered(), r => r.propinsi_ktp), { color: '#2f6fb5', top: 12 });
}
function renderIupSchools() {
  const rows = filtered().filter(r => r.sub_angkatan === 'IUP');
  if (rows.length === 0) {
    showEmpty('chart-iup-schools', 'Program IUP belum dibuka pada tahun ini (dimulai 2024). Pilih 2024, 2025, atau Semua Tahun.');
    return;
  }
  renderHorizontalBar('chart-iup-schools', countBy(rows, r => r.sekolah_asal), { color: GOLD, top: 15 });
}

function renderFilteredCharts() {
  renderIpkByJalur();
  renderIpkRegIup();
  renderIpkGender();
  renderGenderDonut();
  renderBloodDonut();
  renderAgama();
  renderPekerjaan();
  renderPropinsi();
  renderIupSchools();
  renderHeroStats();
}

// ================================================================
// Charts that DO NOT respect the filter — they ARE the year-trend
// ================================================================

function renderEnrollmentTrend() {
  const chart = getChart('chart-enrollment');
  const byYear = YEARS.map(y => {
    const rows = STATE.raw.filter(r => r.source_year === y);
    const c = countBy(rows, r => r.jalur_masuk);
    return JALUR_ORDER.map(j => c.get(j) || 0);
  });
  const series = JALUR_ORDER.map((jalur, i) => ({
    name: jalur,
    type: 'bar',
    stack: 'total',
    barMaxWidth: 46,
    itemStyle: { color: JALUR_COLORS[jalur] },
    data: byYear.map(row => row[i]),
  }));
  chart.setOption({
    textStyle: baseTextStyle(),
    color: JALUR_ORDER.map(j => JALUR_COLORS[j]),
    grid: { left: 46, right: 20, top: 12, bottom: 56 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, textStyle: { fontFamily: FONT_SANS, fontSize: 11 } },
    xAxis: {
      type: 'category', data: YEARS.map(String),
      axisLabel: { fontFamily: FONT_MONO, fontSize: 11 },
      axisLine: { lineStyle: { color: GRAY_200 } },
    },
    yAxis: { type: 'value', axisLabel: { fontFamily: FONT_MONO, fontSize: 11 }, splitLine: { lineStyle: { color: GRAY_200 } } },
    series,
  }, true);
}

function renderIpkTrend() {
  const chart = getChart('chart-ipk-trend');
  const stats = YEARS.map(y => {
    const values = STATE.raw.filter(r => r.source_year === y && r.ipk != null).map(r => r.ipk);
    const m = mean(values);
    const sd = stdev(values);
    return { m, sd, n: values.length };
  });
  chart.setOption({
    textStyle: baseTextStyle(),
    grid: { left: 46, right: 20, top: 16, bottom: 56 },
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const idx = params[0].dataIndex;
        const s = stats[idx];
        return `${YEARS[idx]}<br/>Rata-rata: ${fmt2(s.m)}<br/>Std. dev: ${fmt2(s.sd)}<br/>n = ${fmt(s.n)}`;
      },
    },
    xAxis: {
      type: 'category', data: YEARS.map(String), boundaryGap: false,
      axisLabel: { fontFamily: FONT_MONO, fontSize: 11 },
      axisLine: { lineStyle: { color: GRAY_200 } },
    },
    yAxis: {
      type: 'value', name: 'IPK', min: 0, max: 4,
      nameTextStyle: { fontFamily: FONT_MONO, fontSize: 10, color: GRAY_400 },
      axisLabel: { fontFamily: FONT_MONO, fontSize: 11 },
      splitLine: { lineStyle: { color: GRAY_200 } },
    },
    series: [
      {
        name: 'batas bawah', type: 'line', data: stats.map(s => Number((s.m - s.sd).toFixed(3))),
        lineStyle: { opacity: 0 }, symbol: 'none', stack: 'band', areaStyle: { opacity: 0 }, silent: true, tooltip: { show: false },
      },
      {
        name: '± 1 std. dev', type: 'line', data: stats.map(s => Number((2 * s.sd).toFixed(3))),
        lineStyle: { opacity: 0 }, symbol: 'none', stack: 'band',
        areaStyle: { color: '#2f6fb5', opacity: 0.14 }, silent: true, tooltip: { show: false },
      },
      {
        name: 'Rata-rata IPK', type: 'line', data: stats.map(s => Number((s.m ?? 0).toFixed(3))),
        lineStyle: { width: 3, color: NAVY }, itemStyle: { color: NAVY },
        symbol: 'circle', symbolSize: 7, z: 10,
      },
    ],
    legend: {
      bottom: 0, data: ['Rata-rata IPK', '± 1 std. dev'],
      textStyle: { fontFamily: FONT_SANS, fontSize: 11 },
    },
  }, true);
}

function renderDropoutTrend() {
  const chart = getChart('chart-dropout');
  const counts = YEARS.map(y => STATE.raw.filter(r => r.source_year === y && r.status_akhir === 'MENGUNDURKAN DIRI').length);
  const totals = YEARS.map(y => STATE.raw.filter(r => r.source_year === y).length);
  chart.setOption({
    textStyle: baseTextStyle(),
    grid: { left: 40, right: 20, top: 16, bottom: 40 },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: params => {
        const i = params[0].dataIndex;
        return `${YEARS[i]}<br/>Mengundurkan diri: ${fmt(counts[i])} dari ${fmt(totals[i])} (${pct(counts[i], totals[i])})`;
      },
    },
    xAxis: { type: 'category', data: YEARS.map(String), axisLabel: { fontFamily: FONT_MONO, fontSize: 11 }, axisLine: { lineStyle: { color: GRAY_200 } } },
    yAxis: { type: 'value', axisLabel: { fontFamily: FONT_MONO, fontSize: 11 }, splitLine: { lineStyle: { color: GRAY_200 } } },
    series: [{
      type: 'bar', data: counts, barMaxWidth: 46,
      itemStyle: { color: CRITICAL, borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: 'top', formatter: p => p.value || '', fontFamily: FONT_MONO, fontSize: 11, color: GRAY_600 },
    }],
  }, true);
}

function renderStatusTable() {
  const tbody = document.getElementById('status-table-body');
  const rows = STATUS_ORDER.map(status => {
    const perYear = YEARS.map(y => STATE.raw.filter(r => r.source_year === y && r.status_akhir === status).length);
    const total = perYear.reduce((a, b) => a + b, 0);
    return { status, perYear, total };
  }).filter(r => r.total > 0);

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.status}${r.status === 'MENGUNDURKAN DIRI' ? ' ⚠' : ''}</td>
      ${r.perYear.map(n => `<td class="num${r.status === 'MENGUNDURKAN DIRI' && n > 0 ? ' critical' : ''}">${n || '–'}</td>`).join('')}
      <td class="num">${fmt(r.total)}</td>
    </tr>
  `).join('');

  const tfoot = document.getElementById('status-table-foot');
  const colTotals = YEARS.map(y => STATE.raw.filter(r => r.source_year === y).length);
  const grand = colTotals.reduce((a, b) => a + b, 0);
  tfoot.innerHTML = `
    <tr>
      <td>Total</td>
      ${colTotals.map(n => `<td class="num">${fmt(n)}</td>`).join('')}
      <td class="num">${fmt(grand)}</td>
    </tr>
  `;
}

function renderAlwaysAllCharts() {
  renderEnrollmentTrend();
  renderIpkTrend();
  renderDropoutTrend();
  renderStatusTable();
}

// ── Hero stats (respect the filter) ────────────────────────────────
function renderHeroStats() {
  const rows = filtered();
  const total = rows.length;
  const ipkValues = rows.filter(r => r.ipk != null).map(r => r.ipk);
  const female = rows.filter(r => r.jenis_kelamin === 'P').length;
  const jalurCounts = countBy(rows, r => r.jalur_masuk);
  let topJalur = '–';
  let topJalurN = -1;
  jalurCounts.forEach((n, j) => { if (n > topJalurN) { topJalurN = n; topJalur = j; } });

  document.getElementById('stat-total').textContent = fmt(total);
  document.getElementById('stat-ipk').textContent = ipkValues.length ? fmt2(mean(ipkValues)) : '–';
  document.getElementById('stat-female').textContent = total ? pct(female, total) : '–';
  document.getElementById('stat-top-jalur').textContent = topJalur;
}

// ── Year filter wiring ──────────────────────────────────────────────
function initYearFilter() {
  const container = document.getElementById('year-filter');
  const chips = [{ value: 'all', label: 'Semua Tahun' }, ...YEARS.map(y => ({ value: String(y), label: String(y) }))];
  container.innerHTML = chips.map(c =>
    `<button class="tif-year-chip${c.value === STATE.year ? ' active' : ''}" data-year="${c.value}">${c.label}</button>`
  ).join('');
  container.addEventListener('click', e => {
    const btn = e.target.closest('.tif-year-chip');
    if (!btn) return;
    STATE.year = btn.dataset.year;
    container.querySelectorAll('.tif-year-chip').forEach(b => b.classList.toggle('active', b === btn));
    renderFilteredCharts();
  });
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  const res = await fetch('processed/students.json');
  STATE.raw = await res.json();
  initYearFilter();
  renderAlwaysAllCharts();
  renderFilteredCharts();
}

init();
