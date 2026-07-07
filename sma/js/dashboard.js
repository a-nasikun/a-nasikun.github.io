/* ================================================================
   SMA Kota Yogyakarta — Dasbor Keketatan Seleksi
   Data: sma/data/public/<year>.json (agregat, tanpa nama/ID siswa)
   Grafik: Apache ECharts (dimuat via CDN di index.html)
   ================================================================ */
'use strict';

const SMA_COLORS = {
  SMAN1:  '#973f35', SMAN2:  '#976635', SMAN3:  '#977e35', SMAN4:  '#5e9735',
  SMAN5:  '#359766', SMAN6:  '#35978a', SMAN7:  '#357a97', SMAN8:  '#355297',
  SMAN9:  '#523597', SMAN10: '#833597', SMAN11: '#973566',
};
const SMP_COLOR    = '#9a9a90';
const CUTOFF_COLOR = '#c9a84c';
const NAVY         = '#0d1b2a';
const NAVY_MID     = '#1a2e45';
const NAVY_SOFT    = '#243b55';
const GRAY_600     = '#5a5a52';
const GRAY_400     = '#9a9a90';
const GRAY_200     = '#e8e8e2';
const GENDER_L     = '#1a2e45';
const GENDER_P     = '#b5657a';
const FONT_SANS    = "'IBM Plex Sans', system-ui, sans-serif";
const FONT_MONO    = "'IBM Plex Mono', monospace";

const shortLabel = kode => kode.replace('SMAN', 'SMAN ');
const fmt = n => n.toLocaleString('id-ID');                                  // untuk jumlah (bilangan bulat)
const fmtScore = n => n.toLocaleString('id-ID', { maximumFractionDigits: 2 }); // untuk skor/jarak (desimal)

// Nama pendek untuk label pada grafik (mis. "SMP NEGERI 1 YOGYAKARTA" -> "SMPN 1 Jogja").
const SMP_PREFIX_RULES = [
  [/^SMP NEGERI\b/i, 'SMPN'],
  [/^SMPN\b/i, 'SMPN'],
  [/^MTS NEGERI\b/i, 'MTsN'],
  [/^MTSN\b/i, 'MTsN'],
  [/^SMP MUHAMMADIYAH\b/i, 'SMP Muh'],
  [/^MTSS MUHAMMADIYAH\b/i, 'MTs Muh'],
  [/^SMP ISLAM TERPADU\b/i, 'SMP IT'],
  [/^SMPIT\b/i, 'SMP IT'],
  [/^SMP KRISTEN\b/i, 'SMP Kr'],
];
function shortSmpName(nama, maxLen = 22) {
  let s = nama;
  for (const [re, repl] of SMP_PREFIX_RULES) {
    if (re.test(s)) { s = s.replace(re, repl); break; }
  }
  s = s.replace(/\bYOGYAKARTA\b/i, 'Jogja');
  if (s.length > maxLen) s = s.slice(0, maxLen - 1).trim() + '…';
  return s;
}

const JALUR_ORDER = ['Zonasi Radius', 'Zonasi Reguler', 'Afirmasi', 'Prestasi', 'Pindah Tugas'];
const JALUR_ABBR = {
  'Zonasi Radius': 'ZRad', 'Zonasi Reguler': 'ZReg', 'Afirmasi': 'Afirm',
  'Prestasi': 'Prestasi', 'Pindah Tugas': 'Pindah',
};

// Baris ringkas rincian per-jalur untuk item daftar mini (mis. "ZReg:3·342,1  Prestasi:2·360,5").
function formatJalurTags(breakdown) {
  if (!breakdown) return '';
  return JALUR_ORDER
    .filter(j => breakdown[j])
    .map(j => {
      const b = breakdown[j];
      const abbr = JALUR_ABBR[j] || j;
      return `<span class="tag-jalur">${abbr}</span><span class="tag-count">${fmt(b.count)}</span>`;
    })
    .join('');
}

function baseTextStyle() {
  return { fontFamily: FONT_SANS, color: GRAY_600 };
}

// Skala linear-di-ruang-akar agar LUAS node sebanding dengan nilainya (ukuran yang adil).
function sqrtScale(value, domainMin, domainMax, rangeMin, rangeMax) {
  const a = Math.sqrt(Math.max(value, 0));
  const aMin = Math.sqrt(Math.max(domainMin, 0));
  const aMax = Math.sqrt(Math.max(domainMax, 1));
  if (aMax === aMin) return (rangeMin + rangeMax) / 2;
  const t = (a - aMin) / (aMax - aMin);
  return rangeMin + t * (rangeMax - rangeMin);
}

function histogram(values, bins = 12) {
  const min = Math.min(...values), max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const counts = new Array(bins).fill(0);
  values.forEach(v => {
    let idx = Math.floor((v - min) / width);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  });
  const labels = counts.map((_, i) => {
    const lo = Math.round(min + i * width);
    const hi = Math.round(min + (i + 1) * width);
    return `${lo}–${hi}`;
  });
  return { labels, counts };
}

// ── State ──────────────────────────────────────────────────────────
let DATA = null;
const chartInstances = {};      // id -> instance echarts
const schoolPanelCharts = {};   // kode -> { breakdown, scores, gender }
const selectedSchools = new Set();
let smpPanelCharts = {};        // { ego, jalur } — hanya satu SMP aktif sekaligus
let smpExplorerInitialized = false;

function registerChart(id, option) {
  const el = document.getElementById(id);
  if (!el) return null;
  if (chartInstances[id]) chartInstances[id].dispose();
  const chart = echarts.init(el);
  chart.setOption(option);
  chartInstances[id] = chart;
  return chart;
}

window.addEventListener('resize', () => {
  Object.values(chartInstances).forEach(c => c.resize());
  Object.values(schoolPanelCharts).forEach(set => Object.values(set).forEach(c => c && c.resize()));
  Object.values(smpPanelCharts).forEach(c => c && c.resize());
});

// ── Boot ───────────────────────────────────────────────────────────
const yearSelect = document.getElementById('year-select');
loadYear(yearSelect.value);
yearSelect.addEventListener('change', () => loadYear(yearSelect.value));

function loadYear(year) {
  fetch(`data/public/${year}.json`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      DATA = data;
      renderHero(data);
      renderNetwork(data);
      renderGlobal(data);
      // Pilih default agar pengguna langsung melihat contoh hasilnya (hanya sekali, tidak menimpa pilihan manual).
      if (selectedSchools.size === 0 && data.schools.some(s => s.kode === 'SMAN1')) {
        selectedSchools.add('SMAN1');
      }
      renderSchoolChips(data);
      renderSchoolPanels(data);
      renderSmpExplorer(data);
    })
    .catch(err => {
      console.error('Gagal memuat data dasbor', err);
      const hero = document.getElementById('hero-stats');
      if (hero) hero.insertAdjacentHTML('afterend',
        '<p style="color:#e8c97a;margin-top:1rem;">Data penerimaan untuk tahun ini tidak dapat dimuat. Silakan coba lagi nanti.</p>');
    });
}

// ── Statistik hero ───────────────────────────────────────────────────
function renderHero(data) {
  document.getElementById('stat-schools').textContent  = data.meta.total_sma;
  document.getElementById('stat-students').textContent = fmt(data.meta.total_students);
  document.getElementById('stat-feeders').textContent   = fmt(data.meta.total_smp);
  document.getElementById('stat-tracks').textContent    = data.meta.jalur_list.length;
}

// ── Grafik jaringan ──────────────────────────────────────────────────
// Menempatkan 11 lingkaran SMA pada posisi tetap di sekeliling tepi kanvas
// (seperti angka pada jam), agar sebaran kotak SMP di sekitarnya terlihat
// jelas alih-alih semua node menumpuk ke tengah akibat gravitasi force-layout.
function computeSmaRingPositions(smaNodes, width, height) {
  const cx = width / 2, cy = height / 2;
  const radius = Math.min(width, height) * 0.38;
  const n = smaNodes.length;
  const positions = {};
  smaNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // mulai dari atas, searah jarum jam
    positions[node.kode] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  return positions;
}

function buildGraphSeriesData(data, { search = '', minCount = 1, ringPositions = null } = {}) {
  const smaTotals = data.network.sma_nodes.map(n => n.total);
  const smpTotals = data.network.smp_nodes.map(n => n.total);
  const smaMax = Math.max(...smaTotals), smaMin = Math.min(...smaTotals);
  const smpMax = Math.max(...smpTotals), smpMin = Math.min(...smpTotals);

  const edges = data.network.edges.filter(e => e.count >= minCount);
  const keepSmp = new Set(edges.map(e => e.target));

  const q = search.trim().toLowerCase();
  const matched = q ? new Set(data.network.smp_nodes
    .filter(n => n.nama.toLowerCase().includes(q))
    .map(n => n.nama)) : null;

  const categories = data.network.sma_nodes.map(n => ({ name: shortLabel(n.kode) }));
  categories.push({ name: 'SMP / MTs (sekolah asal)' });
  const smpCategoryIndex = categories.length - 1;
  const kodeIndex = {};
  data.network.sma_nodes.forEach((n, i) => { kodeIndex[n.kode] = i; });

  const nodes = [];
  data.network.sma_nodes.forEach(n => {
    const dim = matched ? 0.15 : 1;
    const pos = ringPositions ? ringPositions[n.kode] : null;
    nodes.push({
      id: n.kode,
      name: n.nama,
      value: n.total,
      symbol: 'circle',
      symbolSize: sqrtScale(n.total, smaMin, smaMax, 34, 78),
      category: kodeIndex[n.kode],
      itemStyle: { color: SMA_COLORS[n.kode], opacity: dim },
      label: { show: true, formatter: shortLabel(n.kode).replace('SMAN ', ''), fontSize: 11, fontWeight: 700, color: '#fff' },
      ...(pos ? { x: pos.x, y: pos.y, fixed: true } : {}),
    });
  });
  data.network.smp_nodes.forEach(n => {
    if (!keepSmp.has(n.nama)) return;
    const isMatch = matched ? matched.has(n.nama) : true;
    nodes.push({
      id: n.nama,
      name: n.nama,
      value: n.total,
      symbol: 'rect',
      symbolSize: sqrtScale(n.total, smpMin, smpMax, 5, 30),
      category: smpCategoryIndex,
      itemStyle: { color: SMP_COLOR, opacity: isMatch ? 0.95 : 0.12 },
      label: { show: false },
    });
  });

  const links = edges.map(e => ({
    source: e.source,
    target: e.target,
    value: e.count,
    lineStyle: {
      width: sqrtScale(e.count, 1, Math.max(...data.network.edges.map(x => x.count)), 0.6, 7),
      color: 'source',
      opacity: matched ? (matched.has(e.target) ? 0.6 : 0.04) : 0.28,
      curveness: 0.15,
    },
  }));

  return { nodes, links, categories };
}

function renderNetwork(data) {
  const search = document.getElementById('network-search');
  const minCountSlider = document.getElementById('network-min-count');
  const minCountLabel = document.getElementById('network-min-count-label');
  const resetBtn = document.getElementById('network-reset');
  const graphEl = document.getElementById('network-graph');

  function draw() {
    const ringPositions = computeSmaRingPositions(
      data.network.sma_nodes,
      graphEl.clientWidth || 800,
      graphEl.clientHeight || 620,
    );
    const { nodes, links, categories } = buildGraphSeriesData(data, {
      search: search.value,
      minCount: Number(minCountSlider.value),
      ringPositions,
    });
    registerChart('network-graph', {
      textStyle: baseTextStyle(),
      tooltip: {
        formatter(p) {
          if (p.dataType === 'edge') return `${p.data.source} → ${p.data.target}<br/><strong>${fmt(p.data.value)}</strong> siswa`;
          return `<strong>${p.data.name}</strong><br/>${fmt(p.data.value)} siswa`;
        },
      },
      legend: [{
        type: 'scroll', top: 4, textStyle: { fontFamily: FONT_MONO, fontSize: 10, color: GRAY_600 },
        data: categories.map(c => c.name),
      }],
      series: [{
        type: 'graph', layout: 'force', roam: true, draggable: true,
        categories,
        data: nodes,
        links,
        force: { repulsion: 90, edgeLength: [30, 170], gravity: 0.08, friction: 0.25 },
        emphasis: { focus: 'adjacency', label: { show: true, fontSize: 11 }, lineStyle: { opacity: 0.9 } },
        lineStyle: { curveness: 0.15 },
      }],
    });
  }

  draw();
  search.addEventListener('input', draw);
  minCountSlider.addEventListener('input', () => {
    minCountLabel.textContent = minCountSlider.value;
    draw();
  });
  resetBtn.addEventListener('click', () => {
    search.value = '';
    minCountSlider.value = 1;
    minCountLabel.textContent = '1';
    draw();
  });

  // Alternatif tabel data yang mudah diakses (aksesibilitas)
  const tbody = document.querySelector('#network-table tbody');
  const rows = [...data.network.edges].sort((a, b) => b.count - a.count);
  tbody.innerHTML = rows.map(e =>
    `<tr><td>${e.target}</td><td>${shortLabel(e.source)}</td><td>${fmt(e.count)}</td></tr>`
  ).join('');

  // Hitung ulang cincin posisi SMA saat kontainer berubah ukuran (mis. resize jendela).
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 200);
  });
}

// ── Indikator global ────────────────────────────────────────────
function renderGlobal(data) {
  renderRankingChart(data);
  renderJalurTotalsChart(data);
  renderGenderChart(data.overall.gender, 'chart-gender');
  renderJalurRangeChart(data);
  renderRadiusHistogram(data);
  renderTopFeedersChart(data.overall.top_feeders, 'chart-top-feeders', 15);
}

function renderRankingChart(data) {
  const ranking = data.overall.cutoff_ranking;
  const names = ranking.map(r => shortLabel(r.kode));
  const values = ranking.map(r => r.cutoff);
  const colors = ranking.map(r => SMA_COLORS[r.kode]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  registerChart('chart-ranking', {
    textStyle: baseTextStyle(),
    grid: { left: 90, right: 30, top: 10, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => `${fmtScore(v)} poin` },
    xAxis: { type: 'value', name: 'Skor ambang batas', axisLine: { lineStyle: { color: GRAY_200 } }, splitLine: { lineStyle: { color: GRAY_200 } } },
    yAxis: { type: 'category', data: names, inverse: true, axisLine: { lineStyle: { color: GRAY_200 } }, axisLabel: { fontFamily: FONT_MONO } },
    series: [{
      type: 'bar', data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
      barWidth: '55%',
      label: { show: true, position: 'right', formatter: p => fmtScore(p.value), fontFamily: FONT_MONO, color: GRAY_600 },
      markLine: {
        symbol: 'none',
        lineStyle: { color: CUTOFF_COLOR, type: 'dashed', width: 2 },
        label: { formatter: params => `rata-rata ${fmtScore(params.value)}`, color: CUTOFF_COLOR, fontFamily: FONT_MONO },
        data: [{ xAxis: Math.round(avg * 100) / 100 }],
      },
    }],
  });
}

function renderJalurTotalsChart(data) {
  const jalurList = data.meta.jalur_list;
  const values = jalurList.map(j => (data.overall.jalur[j] ? data.overall.jalur[j].count : 0));
  registerChart('chart-jalur-totals', {
    textStyle: baseTextStyle(),
    grid: { left: 110, right: 55, top: 10, bottom: 20 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => `${fmt(v)} siswa` },
    // Sumbu nilai disembunyikan — kartu ini kini 33% lebar (grid 2 kolom), dan
    // label di ujung tiap batang sudah menunjukkan angka pastinya tanpa perlu tanda sumbu.
    xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: { type: 'category', data: jalurList, inverse: true, axisLabel: { fontFamily: FONT_SANS, fontSize: 11 } },
    series: [{
      type: 'bar', data: values, barWidth: '55%',
      itemStyle: { color: NAVY_SOFT, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: p => fmt(p.value), fontFamily: FONT_MONO, color: GRAY_600 },
    }],
  });
}

function renderGenderChart(gender, elId) {
  registerChart(elId, {
    textStyle: baseTextStyle(),
    tooltip: { trigger: 'item', valueFormatter: v => `${fmt(v)} siswa` },
    legend: { bottom: 0, textStyle: { fontFamily: FONT_SANS, fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['45%', '72%'], center: ['50%', '45%'],
      label: { formatter: '{b}\n{d}%', fontFamily: FONT_SANS, fontSize: 11, color: GRAY_600 },
      data: [
        { name: 'Laki-laki (L)', value: gender.L, itemStyle: { color: GENDER_L } },
        { name: 'Perempuan (P)', value: gender.P, itemStyle: { color: GENDER_P } },
      ],
    }],
  });
}

function renderJalurRangeChart(data) {
  const jalurList = data.meta.jalur_list.filter(j => data.overall.jalur[j] && data.overall.jalur[j].unit === 'skor');
  const mins = jalurList.map(j => data.overall.jalur[j].min);
  const meds = jalurList.map(j => data.overall.jalur[j].median);
  const maxs = jalurList.map(j => data.overall.jalur[j].max);

  registerChart('chart-jalur-range', {
    textStyle: baseTextStyle(),
    grid: { left: 50, right: 20, top: 40, bottom: 60 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => fmtScore(v) },
    legend: { top: 0, textStyle: { fontFamily: FONT_SANS, fontSize: 11 } },
    xAxis: { type: 'category', data: jalurList, axisLabel: { fontSize: 10, interval: 0, rotate: 20 } },
    yAxis: { type: 'value', name: 'Skor', splitLine: { lineStyle: { color: GRAY_200 } } },
    series: [
      { name: 'Min', type: 'bar', data: mins, itemStyle: { color: '#c7d2df' } },
      { name: 'Median', type: 'bar', data: meds, itemStyle: { color: NAVY_SOFT } },
      { name: 'Maks', type: 'bar', data: maxs, itemStyle: { color: NAVY } },
    ],
  });
}

function renderRadiusHistogram(data) {
  const radius = data.overall.jalur['Zonasi Radius'];
  if (!radius) return;
  const { labels, counts } = histogram(radius.values, 10);
  registerChart('chart-radius-hist', {
    textStyle: baseTextStyle(),
    grid: { left: 45, right: 20, top: 20, bottom: 50 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => `${fmt(v)} siswa` },
    xAxis: { type: 'category', data: labels.map(l => l + 'm'), axisLabel: { fontSize: 9, interval: 0, rotate: 40 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: GRAY_200 } } },
    series: [{ type: 'bar', data: counts, itemStyle: { color: NAVY_SOFT, borderRadius: [4, 4, 0, 0] } }],
  });
}

function renderTopFeedersChart(feeders, elId, limit = 15) {
  const top = feeders.slice(0, limit);
  registerChart(elId, {
    textStyle: baseTextStyle(),
    grid: { left: 220, right: 40, top: 10, bottom: 30 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => `${fmt(v)} siswa` },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: GRAY_200 } } },
    yAxis: {
      type: 'category', data: top.map(f => f.asal_sekolah).reverse(), inverse: false,
      axisLabel: { fontSize: 10, width: 200, overflow: 'truncate' },
    },
    series: [{
      type: 'bar', data: top.map(f => f.count).reverse(), barWidth: '60%',
      itemStyle: { color: NAVY_SOFT, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: p => fmt(p.value), fontFamily: FONT_MONO, color: GRAY_600 },
    }],
  });
}

// ── Eksplorasi per sekolah ──────────────────────────────────────────
function renderSchoolChips(data) {
  const wrap = document.getElementById('school-chips');
  wrap.innerHTML = data.schools.map(s => {
    const isActive = selectedSchools.has(s.kode);
    return `
    <button class="sma-chip${isActive ? ' active' : ''}" data-kode="${s.kode}" aria-pressed="${isActive}">
      <span class="dot" style="background:${SMA_COLORS[s.kode]}"></span>
      ${shortLabel(s.kode)}
      <span class="count">${fmt(s.total)}</span>
    </button>
  `;
  }).join('');

  wrap.querySelectorAll('.sma-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const kode = chip.dataset.kode;
      if (selectedSchools.has(kode)) {
        selectedSchools.delete(kode);
        chip.classList.remove('active');
        chip.setAttribute('aria-pressed', 'false');
      } else {
        selectedSchools.add(kode);
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');
      }
      renderSchoolPanels(data);
    });
  });
}

function renderSchoolPanels(data) {
  const container = document.getElementById('school-panels');
  const emptyState = document.getElementById('school-empty-state');

  if (selectedSchools.size === 0) {
    Object.keys(schoolPanelCharts).forEach(disposeSchoolCharts);
    container.innerHTML = '<div class="sma-empty-state" id="school-empty-state">Pilih sekolah di atas untuk melihat statistik penerimaannya.</div>';
    return;
  }
  if (emptyState) emptyState.remove();

  // Hapus panel untuk sekolah yang tidak lagi dipilih
  Object.keys(schoolPanelCharts).forEach(kode => {
    if (!selectedSchools.has(kode)) {
      disposeSchoolCharts(kode);
      const el = document.getElementById(`panel-${kode}`);
      if (el) el.remove();
    }
  });

  const orderedSelected = data.schools.filter(s => selectedSchools.has(s.kode));
  orderedSelected.forEach(school => {
    if (document.getElementById(`panel-${school.kode}`)) return; // sudah dirender
    container.insertAdjacentHTML('beforeend', schoolPanelTemplate(data, school));
    mountSchoolCharts(data, school);
  });
}

function disposeSchoolCharts(kode) {
  const set = schoolPanelCharts[kode];
  if (!set) return;
  Object.values(set).forEach(c => c && c.dispose());
  delete schoolPanelCharts[kode];
}

function rankOf(data, kode) {
  const idx = data.overall.cutoff_ranking.findIndex(r => r.kode === kode);
  return idx === -1 ? null : idx + 1;
}

function schoolPanelTemplate(data, school) {
  const color = SMA_COLORS[school.kode];
  const rank = rankOf(data, school.kode);
  const feeders = school.top_feeders.slice(0, 6);
  return `
    <article class="sma-school-panel" id="panel-${school.kode}" style="border-left-color:${color}">
      <div class="sma-school-panel-header">
        <h3><span class="dot" style="background:${color}"></span>${school.nama}</h3>
        <span class="rank-tag">${rank ? `#${rank} dari ${data.meta.total_sma} sekolah berdasarkan ambang batas Zonasi Reguler` : ''} · ${fmt(school.total)} diterima</span>
      </div>
      <div class="sma-panel-grid">
        <div style="grid-column: 1 / -1;">
          <h3 style="font-size:0.9rem;">Sekolah asal mana saja yang mengirim siswa ke sini?</h3>
          <div class="network-controls">
            <div class="network-slider-wrap">
              <span>Min. siswa per SMP</span>
              <input type="range" id="panel-${school.kode}-min-count" min="1" max="20" value="5" step="1" />
              <span id="panel-${school.kode}-min-count-label">5</span>
            </div>
            <button class="btn-ghost" id="panel-${school.kode}-graph-reset">Atur ulang tampilan</button>
          </div>
          <div id="panel-${school.kode}-graph" class="sma-chart" style="height:420px;"></div>
          <p class="network-legend-hint">Ukuran kotak SMP di sini menunjukkan jumlah siswa yang dikirim ke <strong>${school.nama}</strong> secara spesifik, bukan total keseluruhan siswa yang diluluskan sekolah tersebut.</p>
        </div>
        <div>
          <h3 style="font-size:0.9rem;">Diterima per jalur</h3>
          <div id="panel-${school.kode}-breakdown" class="sma-chart" style="height:220px;"></div>
        </div>
        <div>
          <h3 style="font-size:0.9rem;">Rentang skor per jalur</h3>
          <div id="panel-${school.kode}-scores" class="sma-chart" style="height:220px;"></div>
          <div class="sma-cutoff-note marker"><span class="swatch"></span> penanda emas = ambang batas sekolah ini (skor terendah yang diterima)</div>
        </div>
        <div>
          <h3 style="font-size:0.9rem;">Keseimbangan gender</h3>
          <div id="panel-${school.kode}-gender" class="sma-chart" style="height:220px;"></div>
        </div>
        <div style="grid-column: 1 / -1;">
          <h3 style="font-size:0.9rem;">Sekolah asal teratas</h3>
          <ul class="sma-mini-list">
            ${feeders.map(f => {
              const breakdown = (data.by_sma_smp[school.kode] || {})[f.asal_sekolah];
              const tags = formatJalurTags(breakdown);
              return `<li>
                <div class="row">
                  <span class="name">${f.asal_sekolah}</span>
                  ${tags ? `<span class="tags">${tags}</span>` : ''}
                  <span class="n">${fmt(f.count)}</span>
                </div>
              </li>`;
            }).join('')}
          </ul>
        </div>
      </div>
    </article>
  `;
}

function mountSchoolGraph(data, school) {
  const graphEl = document.getElementById(`panel-${school.kode}-graph`);
  const minSlider = document.getElementById(`panel-${school.kode}-min-count`);
  const minLabel = document.getElementById(`panel-${school.kode}-min-count-label`);
  const resetBtn = document.getElementById(`panel-${school.kode}-graph-reset`);
  const color = SMA_COLORS[school.kode];
  const DEFAULT_MIN = 5;

  const allFeeders = data.network.edges
    .filter(e => e.source === school.kode)
    .map(e => ({ nama: e.target, count: e.count }))
    .sort((a, b) => b.count - a.count);

  const graph = echarts.init(graphEl);

  function draw() {
    const minCount = Number(minSlider.value);
    const feeders = allFeeders.filter(f => f.count >= minCount);
    const counts = feeders.map(f => f.count);
    const minC = counts.length ? Math.min(...counts) : 1;
    const maxC = counts.length ? Math.max(...counts) : 1;
    const centerX = graphEl.clientWidth / 2;
    const centerY = graphEl.clientHeight / 2;

    const nodes = [
      {
        id: '__sma__', name: school.nama, value: school.total,
        symbol: 'circle', symbolSize: 46,
        itemStyle: { color },
        label: { show: true, formatter: shortLabel(school.kode).replace('SMAN ', ''), fontSize: 12, fontWeight: 700, color: '#fff' },
        fixed: true, x: centerX, y: centerY,
      },
      ...feeders.map(f => ({
        id: f.nama, name: f.nama, value: f.count,
        symbol: 'rect',
        symbolSize: sqrtScale(f.count, minC, maxC, 10, 46),
        itemStyle: { color: SMP_COLOR },
        label: { show: true, position: 'right', formatter: shortSmpName(f.nama), fontSize: 9, color: GRAY_600 },
      })),
    ];
    const links = feeders.map(f => ({
      source: '__sma__', target: f.nama, value: f.count,
      lineStyle: { width: sqrtScale(f.count, minC, maxC, 0.6, 6), color, opacity: 0.3, curveness: 0.12 },
    }));

    graph.setOption({
      textStyle: baseTextStyle(),
      tooltip: {
        formatter(p) {
          if (p.dataType === 'edge') return `${p.data.target} → ${school.nama}<br/><strong>${fmt(p.data.value)}</strong> siswa`;
          if (p.data.id === '__sma__') return `<strong>${school.nama}</strong><br/>${fmt(school.total)} siswa diterima total`;
          return `<strong>${p.data.name}</strong><br/>${fmt(p.data.value)} siswa ke ${school.nama}`;
        },
      },
      series: [{
        type: 'graph', layout: 'force', roam: true, draggable: true,
        data: nodes, links,
        force: { repulsion: 150, edgeLength: [50, 180], gravity: 0.1, friction: 0.3 },
        emphasis: { focus: 'adjacency', label: { show: true } },
        lineStyle: { curveness: 0.12 },
      }],
    }, true);
  }

  draw();
  minSlider.addEventListener('input', () => {
    minLabel.textContent = minSlider.value;
    draw();
  });
  resetBtn.addEventListener('click', () => {
    minSlider.value = DEFAULT_MIN;
    minLabel.textContent = String(DEFAULT_MIN);
    draw();
  });

  return graph;
}

function mountSchoolCharts(data, school) {
  const color = SMA_COLORS[school.kode];
  const jalurList = data.meta.jalur_list.filter(j => school.jalur[j]);

  const graph = mountSchoolGraph(data, school);

  const breakdown = echarts.init(document.getElementById(`panel-${school.kode}-breakdown`));
  breakdown.setOption({
    textStyle: baseTextStyle(),
    grid: { left: 100, right: 30, top: 10, bottom: 20 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => `${fmt(v)} siswa` },
    xAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: GRAY_200 } } },
    yAxis: { type: 'category', data: jalurList, inverse: true, axisLabel: { fontSize: 10 } },
    series: [{
      type: 'bar', barWidth: '55%',
      data: jalurList.map(j => school.jalur[j].count),
      itemStyle: { color },
      label: { show: true, position: 'right', formatter: p => fmt(p.value), fontFamily: FONT_MONO, fontSize: 10, color: GRAY_600 },
    }],
  });

  const scoreJalur = jalurList.filter(j => school.jalur[j].unit === 'skor');
  const scores = echarts.init(document.getElementById(`panel-${school.kode}-scores`));
  scores.setOption({
    textStyle: baseTextStyle(),
    grid: { left: 100, right: 30, top: 10, bottom: 20 },
    tooltip: {
      trigger: 'item',
      formatter(p) {
        if (p.seriesName === 'Ambang batas') return `${p.value[1]}<br/>Ambang batas (nilai minimum diterima): <strong>${fmtScore(p.value[0])}</strong>`;
        return `${p.name}<br/>Nilai tertinggi diterima: <strong>${fmtScore(p.value)}</strong>`;
      },
    },
    xAxis: { type: 'value', axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: GRAY_200 } } },
    yAxis: { type: 'category', data: scoreJalur, inverse: true, axisLabel: { fontSize: 10 } },
    series: [
      {
        name: 'Nilai tertinggi diterima', type: 'bar', barWidth: '45%',
        data: scoreJalur.map(j => school.jalur[j].max),
        itemStyle: { color, opacity: 0.55 },
        label: { show: true, position: 'right', formatter: p => fmtScore(p.value), fontFamily: FONT_MONO, fontSize: 10, color: GRAY_600 },
      },
      {
        name: 'Ambang batas', type: 'scatter', symbol: 'rect', symbolSize: [4, 20], z: 5,
        itemStyle: { color: CUTOFF_COLOR },
        data: scoreJalur.map(j => [school.jalur[j].cutoff, j]),
      },
    ],
  });

  const gender = echarts.init(document.getElementById(`panel-${school.kode}-gender`));
  gender.setOption({
    textStyle: baseTextStyle(),
    tooltip: { trigger: 'item', valueFormatter: v => `${fmt(v)} siswa` },
    legend: { bottom: 0, textStyle: { fontFamily: FONT_SANS, fontSize: 10 } },
    series: [{
      type: 'pie', radius: ['42%', '70%'], center: ['50%', '42%'],
      label: { formatter: '{d}%', fontSize: 10 },
      data: [
        { name: 'L', value: school.gender.L, itemStyle: { color: GENDER_L } },
        { name: 'P', value: school.gender.P, itemStyle: { color: GENDER_P } },
      ],
    }],
  });

  schoolPanelCharts[school.kode] = { graph, breakdown, scores, gender };
}

// ── Eksplorasi sudut pandang SMP ─────────────────────────────────────
function renderSmpExplorer(data) {
  const searchInput = document.getElementById('smp-search');
  const suggestionsBox = document.getElementById('smp-suggestions');
  const searchBtn = document.getElementById('smp-search-btn');
  const resetBtn = document.getElementById('smp-reset-btn');
  const chipsWrap = document.getElementById('smp-top-chips');
  let currentMatches = [];
  let activeIndex = -1;

  // ── 15 sekolah asal paling umum sebagai pintasan cepat ──────────
  const topChipsData = data.network.smp_nodes.slice(0, 15);
  chipsWrap.innerHTML = topChipsData.map(n => `
    <button class="sma-chip smp-chip" data-smp="${n.nama.replace(/"/g, '&quot;')}" aria-pressed="false" title="${n.nama}">
      <span class="dot" style="background:${SMP_COLOR}"></span>
      <span class="label">${n.nama}</span>
      <span class="count">${fmt(n.total)}</span>
    </button>
  `).join('');
  chipsWrap.querySelectorAll('.sma-chip').forEach(chip => {
    chip.addEventListener('click', () => selectSmp(chip.dataset.smp));
  });

  function setActiveChip(name) {
    chipsWrap.querySelectorAll('.sma-chip').forEach(chip => {
      const isActive = chip.dataset.smp === name;
      chip.classList.toggle('active', isActive);
      chip.setAttribute('aria-pressed', String(isActive));
    });
  }

  function updateActive(items) {
    items.forEach((el, i) => el.classList.toggle('active-suggestion', i === activeIndex));
  }

  function findMatches(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts = [], contains = [];
    data.network.smp_nodes.forEach(n => {
      const nameLower = n.nama.toLowerCase();
      if (nameLower.startsWith(q)) starts.push(n);
      else if (nameLower.includes(q)) contains.push(n);
    });
    return [...starts, ...contains].slice(0, 8);
  }

  function renderSuggestions(query) {
    const q = query.trim().toLowerCase();
    activeIndex = -1;
    if (!q) { suggestionsBox.hidden = true; suggestionsBox.innerHTML = ''; return; }

    currentMatches = findMatches(query);

    if (currentMatches.length === 0) {
      suggestionsBox.innerHTML = '<div class="sma-suggestion-item" style="cursor:default;color:var(--gray-400);">Tidak ditemukan</div>';
      suggestionsBox.hidden = false;
      return;
    }
    suggestionsBox.innerHTML = currentMatches.map((n, i) => `
      <div class="sma-suggestion-item" data-idx="${i}">
        <span>${n.nama}</span>
        <span class="count">${fmt(n.total)} siswa</span>
      </div>
    `).join('');
    suggestionsBox.hidden = false;
    suggestionsBox.querySelectorAll('.sma-suggestion-item[data-idx]').forEach(el => {
      el.addEventListener('click', () => selectSmp(currentMatches[Number(el.dataset.idx)].nama));
    });
  }

  function selectSmp(name) {
    searchInput.value = name;
    suggestionsBox.hidden = true;
    setActiveChip(name);
    renderSmpPanel(data, name);
  }

  function searchCurrentInput() {
    if (!searchInput.value.trim()) return;
    // Selalu hitung ulang dari teks saat ini, jangan andalkan state dropdown yang mungkin basi.
    const freshMatches = findMatches(searchInput.value);
    const pick = (suggestionsBox.hidden ? null : freshMatches[activeIndex]) || freshMatches[0];
    if (pick) selectSmp(pick.nama);
  }

  function resetExplorer() {
    searchInput.value = '';
    suggestionsBox.hidden = true;
    suggestionsBox.innerHTML = '';
    currentMatches = [];
    activeIndex = -1;
    setActiveChip(null);
    Object.values(smpPanelCharts).forEach(c => c && c.dispose());
    smpPanelCharts = {};
    document.getElementById('smp-panel-container').innerHTML =
      '<div class="sma-empty-state" id="smp-empty-state">Cari dan pilih sekolah menengah pertama (SMP/MTs) di atas untuk melihat ke mana para alumninya melanjutkan sekolah.</div>';
  }

  searchInput.addEventListener('input', () => renderSuggestions(searchInput.value));
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) renderSuggestions(searchInput.value); });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchCurrentInput();
      return;
    }
    if (suggestionsBox.hidden) return;
    const items = [...suggestionsBox.querySelectorAll('.sma-suggestion-item[data-idx]')];
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); updateActive(items); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); updateActive(items); }
    else if (e.key === 'Escape') { suggestionsBox.hidden = true; }
  });
  searchBtn.addEventListener('click', searchCurrentInput);
  resetBtn.addEventListener('click', resetExplorer);
  document.addEventListener('click', e => {
    if (!e.target.closest('.sma-smp-search-wrap')) suggestionsBox.hidden = true;
  });

  // Pilih default agar pengguna langsung melihat contoh hasilnya (hanya sekali saat pertama dimuat).
  if (!smpExplorerInitialized) {
    smpExplorerInitialized = true;
    const defaultSmp = 'SMP NEGERI 5 YOGYAKARTA';
    if (data.by_smp[defaultSmp]) selectSmp(defaultSmp);
  }
}

function renderSmpPanel(data, smpName) {
  const container = document.getElementById('smp-panel-container');
  Object.values(smpPanelCharts).forEach(c => c && c.dispose());
  smpPanelCharts = {};

  const info = data.by_smp[smpName];
  if (!info) {
    container.innerHTML = '<div class="sma-empty-state">Data tidak ditemukan untuk sekolah ini.</div>';
    return;
  }

  const destinations = data.network.edges
    .filter(e => e.target === smpName)
    .map(e => ({ kode: e.source, nama: shortLabel(e.source), count: e.count }))
    .sort((a, b) => b.count - a.count);

  const rankAll = [...data.network.smp_nodes].sort((a, b) => b.total - a.total);
  const rank = rankAll.findIndex(n => n.nama === smpName) + 1;

  container.innerHTML = smpPanelTemplate(data, smpName, info, destinations, rank);
  mountSmpCharts(data, smpName, info, destinations);
}

function smpPanelTemplate(data, smpName, info, destinations, rank) {
  return `
    <article class="sma-school-panel" id="smp-panel" style="border-left-color:${SMP_COLOR}">
      <div class="sma-school-panel-header">
        <h3><span class="dot" style="background:${SMP_COLOR}"></span>${smpName}</h3>
        <span class="rank-tag">#${rank} dari ${fmt(data.meta.total_smp)} sekolah asal berdasarkan total siswa diterima · ${fmt(info.total)} diterima ke ${destinations.length} SMA</span>
      </div>
      <div class="sma-panel-grid">
        <div style="grid-column: 1 / -1;">
          <h3 style="font-size:0.9rem;">Alumni melanjutkan ke SMA mana saja?</h3>
          <div id="smp-ego-graph" class="sma-chart" style="height:340px;"></div>
          <p class="network-legend-hint">Ukuran lingkaran SMA di sini menunjukkan jumlah alumni dari <strong>${smpName}</strong> secara spesifik, bukan total keseluruhan siswa SMA tersebut.</p>
        </div>
        <div class="sma-quad-grid" style="grid-column: 1 / -1;">
          <div>
            <h3 style="font-size:0.9rem;">Diterima per jalur</h3>
            <div id="smp-jalur-chart" class="sma-chart" style="height:240px;"></div>
          </div>
          <div>
            <h3 style="font-size:0.9rem;">Peringkat SMA tujuan</h3>
            <ul class="sma-mini-list">
              ${destinations.map(d => {
                const breakdown = (data.by_sma_smp[d.kode] || {})[smpName];
                const tags = formatJalurTags(breakdown);
                return `<li>
                  <div class="row">
                    <span class="name"><span class="dot" style="display:inline-block;width:0.55rem;height:0.55rem;border-radius:50%;background:${SMA_COLORS[d.kode]};margin-right:0.5rem;"></span>${d.nama}</span>
                    ${tags ? `<span class="tags">${tags}</span>` : ''}
                    <span class="n">${fmt(d.count)}</span>
                  </div>
                </li>`;
              }).join('')}
            </ul>
          </div>
        </div>
      </div>
    </article>
  `;
}

function mountSmpCharts(data, smpName, info, destinations) {
  const egoEl = document.getElementById('smp-ego-graph');
  const counts = destinations.map(d => d.count);
  const minC = Math.min(...counts), maxC = Math.max(...counts);
  const centerX = egoEl.clientWidth / 2;
  const centerY = egoEl.clientHeight / 2;

  const nodes = [
    {
      id: '__smp__', name: smpName, value: info.total,
      symbol: 'rect', symbolSize: 34,
      itemStyle: { color: SMP_COLOR },
      label: { show: true, formatter: 'SMP', fontSize: 10, fontWeight: 700, color: '#fff' },
      fixed: true, x: centerX, y: centerY,
    },
    ...destinations.map(d => ({
      id: d.kode, name: d.nama, value: d.count,
      symbol: 'circle',
      symbolSize: sqrtScale(d.count, minC, maxC, 30, 74),
      itemStyle: { color: SMA_COLORS[d.kode] },
      label: { show: true, formatter: d.nama.replace('SMAN ', ''), fontSize: 11, fontWeight: 700, color: '#fff' },
    })),
  ];
  const links = destinations.map(d => ({
    source: '__smp__', target: d.kode, value: d.count,
    lineStyle: { width: sqrtScale(d.count, minC, maxC, 1.5, 9), color: 'target', opacity: 0.5, curveness: 0.12 },
  }));

  const ego = echarts.init(egoEl);
  ego.setOption({
    textStyle: baseTextStyle(),
    tooltip: {
      formatter(p) {
        if (p.dataType === 'edge') return `${smpName} → ${shortLabel(p.data.target)}<br/><strong>${fmt(p.data.value)}</strong> siswa`;
        if (p.data.id === '__smp__') return `<strong>${smpName}</strong><br/>${fmt(info.total)} siswa diterima total`;
        return `<strong>${p.data.name}</strong><br/>${fmt(p.data.value)} siswa dari ${smpName}`;
      },
    },
    series: [{
      type: 'graph', layout: 'force', roam: true, draggable: true,
      data: nodes, links,
      force: { repulsion: 180, edgeLength: [60, 140], gravity: 0.15, friction: 0.3 },
      emphasis: { focus: 'adjacency', label: { show: true } },
      lineStyle: { curveness: 0.12 },
    }],
  });

  const jalurList = data.meta.jalur_list.filter(j => info.jalur[j]);
  const jalurEl = document.getElementById('smp-jalur-chart');
  const jalurChart = echarts.init(jalurEl);
  jalurChart.setOption({
    textStyle: baseTextStyle(),
    grid: { left: 100, right: 40, top: 10, bottom: 10 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => `${fmt(v)} siswa` },
    // Sumbu nilai disembunyikan — kartu ini kini 33% lebar (sebaris dengan Peringkat SMA tujuan),
    // dan label di ujung tiap batang sudah menunjukkan angka pastinya.
    xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: { type: 'category', data: jalurList, inverse: true, axisLabel: { fontSize: 10 } },
    series: [{
      type: 'bar', barWidth: '55%',
      data: jalurList.map(j => info.jalur[j]),
      itemStyle: { color: NAVY_SOFT },
      label: { show: true, position: 'right', formatter: p => fmt(p.value), fontFamily: FONT_MONO, fontSize: 10, color: GRAY_600 },
    }],
  });

  smpPanelCharts = { ego, jalur: jalurChart };
}
