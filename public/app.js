// App State
let lotteryData = [];
let filteredData = [];
let historyRawData = {}; // Grouped historical data from SQLite
let currentView = 'grid'; // 'grid' | 'table'
let currentSort = 'retornoMedio-desc';
let searchTerm = '';
let betSimulationAmount = 10; // Default simulated investment in R$
let chartInstance = null;
let selectedChartLottery = 'ALL';

// Brand colors for lotteries
const BRAND_COLORS = {
  'Mega-Sena': '#209869',
  'Quina': '#5d34be',
  'Lotofácil': '#930089',
  'Super Sete': '#a8cf45',
  'Lotomania': '#f78100',
  'Dupla Sena': '#a61324',
  'Timemania': '#eab308',
  'Dia de Sorte': '#cb852b',
  '+Milionária': '#1e5088'
};

const BRAND_CLASSES = {
  'Dia de Sorte': 'brand-diadesorte',
  'Lotofácil': 'brand-lotofacil',
  'Super Sete': 'brand-supersete',
  'Lotomania': 'brand-lotomania',
  'Dupla Sena': 'brand-duplasena',
  'Quina': 'brand-quina',
  'Timemania': 'brand-timemania',
  'Mega-Sena': 'brand-megasena',
  '+Milionária': 'brand-maismilionaria'
};

// DOM Elements
const loadingContainer = document.getElementById('loading-container');
const errorBox = document.getElementById('error-box');
const errorMessage = document.getElementById('error-message');
const lotteriesContainer = document.getElementById('lotteries-container');
const podiumSection = document.getElementById('podium-section');

const syncTimeEl = document.getElementById('sync-time');
const btnRefresh = document.getElementById('btn-refresh');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

const viewGridBtn = document.getElementById('view-grid');
const viewTableBtn = document.getElementById('view-table');

const topLotteryName = document.getElementById('top-lottery-name');
const topLotteryReturn = document.getElementById('top-lottery-return');
const highestPrizeValue = document.getElementById('highest-prize-value');
const highestPrizeName = document.getElementById('highest-prize-name');

const btnToggleSim = document.getElementById('btn-toggle-sim');
const simulatorSection = document.getElementById('simulator-section');
const btnCloseSim = document.getElementById('btn-close-sim');
const simAmountInput = document.getElementById('sim-amount');

const detailModal = document.getElementById('detail-modal');
const modalClose = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');

const chartLotterySelect = document.getElementById('chart-lottery-select');

// Formatting Helpers
function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatProbability(prob) {
  if (!prob || isNaN(prob)) return 'N/A';
  const ratio = Math.round(1 / prob);
  return `1 em ${ratio.toLocaleString('pt-BR')}`;
}

function formatScientific(prob) {
  if (!prob || isNaN(prob)) return '';
  return prob.toExponential(4);
}

// Fetch Data (Server first, client fallback)
async function fetchLotteries(forceRefresh = false) {
  showLoading(true);
  hideError();

  try {
    let data;
    // 1. Try Express backend endpoint
    try {
      const url = `/api/loterias${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
      lotteryData = data.lotteries;
      updateSyncTime(data.updatedAt);
    } catch (serverErr) {
      console.warn('Backend Express indisponível ou estático. Tentando fallback direto...', serverErr);
      lotteryData = await fetchFallbackDirect();
      updateSyncTime(new Date().toISOString());
    }

    if (!lotteryData || lotteryData.length === 0) {
      throw new Error('Nenhum dado de loteria foi retornado.');
    }

    // Fetch Historical SQLite Timeline for Chart
    await fetchHistoryData();

    processAndRenderData();
  } catch (err) {
    showError(`Erro ao carregar dados: ${err.message}`);
  } finally {
    showLoading(false);
  }
}

// Fetch History Data from SQLite Endpoint
async function fetchHistoryData() {
  try {
    const res = await fetch('/api/historico');
    if (res.ok) {
      historyRawData = await res.json();
      renderChart();
    }
  } catch (e) {
    console.warn('Não foi possível carregar o histórico de gráficos do SQLite:', e.message);
  }
}

// Render Line Chart using Chart.js (Deduplicated single date per column)
function renderChart() {
  const ctx = document.getElementById('historyChart')?.getContext('2d');
  if (!ctx || !historyRawData || Object.keys(historyRawData).length === 0) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const lotteryKeys = selectedChartLottery === 'ALL'
    ? Object.keys(historyRawData)
    : [selectedChartLottery];

  // 1. Extract unique dates (YYYY-MM-DD) across all selected lotteries
  const dateMap = new Map(); // 'YYYY-MM-DD' => 'DD/MM'

  lotteryKeys.forEach(lotName => {
    const records = historyRawData[lotName] || [];
    records.forEach(r => {
      if (r.date) {
        const isoDate = r.date.split('T')[0];
        if (!dateMap.has(isoDate)) {
          const parts = isoDate.split('-'); // [YYYY, MM, DD]
          const dayMonth = parts.length === 3 ? `${parts[2]}/${parts[1]}` : isoDate;
          dateMap.set(isoDate, dayMonth);
        }
      }
    });
  });

  // Sort unique ISO dates chronologically
  const sortedIsoDates = Array.from(dateMap.keys()).sort();
  const labels = sortedIsoDates.map(iso => dateMap.get(iso));

  const datasets = [];

  // 2. Build aligned dataset for each lottery without repeating dates
  lotteryKeys.forEach(lotName => {
    const records = historyRawData[lotName] || [];
    const recordByDate = {};

    records.forEach(r => {
      if (r.date) {
        const iso = r.date.split('T')[0];
        recordByDate[iso] = r.retornoMedio; // Latest value for that date
      }
    });

    const dataPoints = sortedIsoDates.map(iso => recordByDate[iso] !== undefined ? recordByDate[iso] : null);
    const color = BRAND_COLORS[lotName] || '#3b82f6';

    datasets.push({
      label: lotName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + '22',
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      spanGaps: true,
      fill: selectedChartLottery !== 'ALL'
    });
  });

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Plus Jakarta Sans', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#131b2e',
          titleColor: '#f8fafc',
          bodyColor: '#10b981',
          borderColor: 'rgba(255,255,255,0.18)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#64748b',
            callback: function(val) {
              return 'R$ ' + val.toFixed(2);
            }
          }
        }
      }
    }
  });
}

// Fallback logic if opening index.html directly without server
async function fetchFallbackDirect() {
  const lotJsonRes = await fetch('./lot.json');
  const rawList = await lotJsonRes.json();

  const promises = rawList.map(async (item) => {
    const name = item.Loteria || item.Loterias;
    const prob = parseFloat(item.Probabilidade);
    try {
      const res = await fetch(item.URL);
      const apiData = await res.json();
      const val = parseFloat(apiData.valorEstimadoProximoConcurso) || 0;
      return {
        loteria: name,
        probabilidade: prob,
        probabilidadeTexto: item.Probabilidade,
        url: item.URL,
        valorEstimadoProximoConcurso: val,
        retornoMedio: val * prob,
        acumulou: apiData.acumulou || false,
        concurso: apiData.concurso || null,
        proximoConcurso: apiData.proximoConcurso || null,
        dataProximoConcurso: apiData.dataProximoConcurso || null,
        dezenas: apiData.dezenas || [],
        premiacoes: apiData.premiacoes || [],
        valorAcumuladoProximoConcurso: apiData.valorAcumuladoProximoConcurso || 0,
        apiDataRaw: apiData
      };
    } catch (e) {
      return {
        loteria: name,
        probabilidade: prob,
        probabilidadeTexto: item.Probabilidade,
        url: item.URL,
        valorEstimadoProximoConcurso: 0,
        retornoMedio: 0,
        error: e.message
      };
    }
  });

  const results = await Promise.all(promises);
  results.sort((a, b) => b.retornoMedio - a.retornoMedio);
  return results.map((item, idx) => ({ rank: idx + 1, ...item }));
}

// Process and Filter Data
function processAndRenderData() {
  // Apply Search
  filteredData = lotteryData.filter(item => 
    item.loteria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply Sorting
  filteredData.sort((a, b) => {
    switch (currentSort) {
      case 'retornoMedio-desc':
        return b.retornoMedio - a.retornoMedio;
      case 'valorEstimado-desc':
        return b.valorEstimadoProximoConcurso - a.valorEstimadoProximoConcurso;
      case 'probabilidade-desc':
        return b.probabilidade - a.probabilidade;
      case 'nome-asc':
        return a.loteria.localeCompare(b.loteria);
      default:
        return b.retornoMedio - a.retornoMedio;
    }
  });

  updateTopMetrics();
  renderPodium();
  renderMainList();
}

// Update Header Summary Metrics
function updateTopMetrics() {
  if (!lotteryData.length) return;

  const topByReturn = [...lotteryData].sort((a, b) => b.retornoMedio - a.retornoMedio)[0];
  if (topByReturn) {
    topLotteryName.textContent = topByReturn.loteria;
    topLotteryReturn.textContent = `${formatCurrency(topByReturn.retornoMedio)} por real estatístico`;
  }

  const topByPrize = [...lotteryData].sort((a, b) => b.valorEstimadoProximoConcurso - a.valorEstimadoProximoConcurso)[0];
  if (topByPrize) {
    highestPrizeValue.textContent = formatCurrency(topByPrize.valorEstimadoProximoConcurso);
    highestPrizeName.textContent = `${topByPrize.loteria} ${topByPrize.acumulou ? '🔥 Acumulada' : ''}`;
  }
}

// Render Top 3 Podium Highlights
function renderPodium() {
  podiumSection.innerHTML = '';
  
  if (searchTerm || currentSort !== 'retornoMedio-desc') {
    podiumSection.style.display = 'none';
    return;
  }
  podiumSection.style.display = 'grid';

  const top3 = lotteryData.slice(0, 3);
  const maxReturn = top3[0]?.retornoMedio || 1;

  top3.forEach((item, index) => {
    const rankNum = index + 1;
    const brandClass = BRAND_CLASSES[item.loteria] || '';
    const progressPercent = Math.min(100, Math.round((item.retornoMedio / maxReturn) * 100));
    const simReturn = item.retornoMedio * betSimulationAmount;

    const cardHtml = `
      <div class="podium-card rank-${rankNum} ${brandClass}">
        <span class="podium-badge">
          ${rankNum === 1 ? '🥇 1º LUGAR VANTAJOSO' : rankNum === 2 ? '🥈 2º LUGAR' : '🥉 3º LUGAR'}
        </span>

        <div class="lottery-header">
          <div class="lottery-dot"></div>
          <div>
            <h3 class="lottery-title">${item.loteria}</h3>
            ${item.acumulou ? '<span class="tag-live" style="background:rgba(244,63,94,0.15); color:#f43f5e; border-color:rgba(244,63,94,0.3)">ACUMULOU! 🔥</span>' : ''}
          </div>
        </div>

        <div class="retorno-box">
          <span class="retorno-label">Retorno Médio por Aposta Base</span>
          <div class="retorno-value font-mono">${formatCurrency(item.retornoMedio)}</div>
          ${betSimulationAmount > 1 ? `<div style="font-size:0.8rem; color:#a855f7; margin-top:4px; font-weight:600">Simulação R$ ${betSimulationAmount}: Retorno Médio = ${formatCurrency(simReturn)}</div>` : ''}
        </div>

        <div class="lottery-details-grid">
          <div class="detail-item">
            <span class="detail-label">Prêmio Estimado</span>
            <span class="detail-val font-mono">${formatCurrency(item.valorEstimadoProximoConcurso)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Chance de Ganhar</span>
            <span class="detail-val font-mono">${formatProbability(item.probabilidade)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Próximo Sorteio</span>
            <span class="detail-val">${item.dataProximoConcurso || 'Em breve'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Concurso</span>
            <span class="detail-val">#${item.proximoConcurso || '--'}</span>
          </div>
        </div>

        <div class="progress-bar-container" title="Vantagem relativa em relação ao líder">
          <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
        </div>

        <button class="btn-card-details" onclick="openLotteryDetail('${item.loteria}')">
          🔍 Ver Detalhes e Fórmula
        </button>
      </div>
    `;

    podiumSection.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// Render Main List (Grid or Table)
function renderMainList() {
  lotteriesContainer.innerHTML = '';

  if (filteredData.length === 0) {
    lotteriesContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Nenhuma loteria encontrada para "${searchTerm}".</div>`;
    return;
  }

  if (currentView === 'grid') {
    renderGridView();
  } else {
    renderTableView();
  }
}

// Render Grid View Cards
function renderGridView() {
  lotteriesContainer.className = 'lotteries-grid';
  const maxReturn = lotteryData[0]?.retornoMedio || 1;

  filteredData.forEach(item => {
    const brandClass = BRAND_CLASSES[item.loteria] || '';
    const progressPercent = Math.min(100, Math.round((item.retornoMedio / maxReturn) * 100));

    const card = document.createElement('div');
    card.className = `lottery-card ${brandClass}`;
    card.innerHTML = `
      <div>
        <div class="card-top">
          <div class="brand" style="gap:10px">
            <div class="lottery-dot"></div>
            <h3 style="font-size:1.15rem; font-weight:800">${item.loteria}</h3>
          </div>
          <span class="rank-pill">Rank #${item.rank}</span>
        </div>

        <div class="retorno-box" style="margin-bottom:12px; padding:10px 14px">
          <span class="retorno-label" style="font-size:0.7rem">Retorno Médio</span>
          <div class="retorno-value font-mono" style="font-size:1.35rem">${formatCurrency(item.retornoMedio)}</div>
        </div>

        <div class="lottery-details-grid" style="margin-bottom:12px; gap:8px">
          <div class="detail-item">
            <span class="detail-label">Prêmio Estimado</span>
            <span class="detail-val font-mono">${formatCurrency(item.valorEstimadoProximoConcurso)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Probabilidade</span>
            <span class="detail-val font-mono" style="font-size:0.8rem">${formatProbability(item.probabilidade)}</span>
          </div>
        </div>

        <div class="progress-bar-container" style="height:6px; margin-bottom:12px">
          <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>

      <button class="btn-card-details" onclick="openLotteryDetail('${item.loteria}')">
        Ver Estatísticas
      </button>
    `;
    lotteriesContainer.appendChild(card);
  });
}

// Render Table View
function renderTableView() {
  lotteriesContainer.className = '';
  
  let rowsHtml = '';
  filteredData.forEach(item => {
    const brandClass = BRAND_CLASSES[item.loteria] || '';

    rowsHtml += `
      <tr class="${brandClass}">
        <td style="font-weight:800; color:var(--text-muted)">#${item.rank}</td>
        <td>
          <div style="display:flex; align-items:center; gap:10px; font-weight:700">
            <div class="lottery-dot"></div>
            <span>${item.loteria}</span>
            ${item.acumulou ? '<span class="tag-live" style="font-size:0.6rem">ACUMULOU</span>' : ''}
          </div>
        </td>
        <td class="font-mono" style="font-weight:800; color:var(--emerald-accent); font-size:1rem">
          ${formatCurrency(item.retornoMedio)}
        </td>
        <td class="font-mono" style="font-weight:700">
          ${formatCurrency(item.valorEstimadoProximoConcurso)}
        </td>
        <td class="font-mono" style="font-size:0.85rem">
          ${formatProbability(item.probabilidade)}
        </td>
        <td>${item.dataProximoConcurso || '--'}</td>
        <td style="text-align:right">
          <button class="btn-card-details" style="padding:6px 12px; font-size:0.8rem; width:auto" onclick="openLotteryDetail('${item.loteria}')">
            Detalhes
          </button>
        </td>
      </tr>
    `;
  });

  const tableHtml = `
    <div class="lotteries-table-wrapper">
      <table class="lotteries-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Loteria</th>
            <th>Retorno Médio</th>
            <th>Prêmio Estimado</th>
            <th>Probabilidade</th>
            <th>Próximo Sorteio</th>
            <th style="text-align:right">Ação</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  lotteriesContainer.innerHTML = tableHtml;
}

// Modal Details Window
window.openLotteryDetail = function(name) {
  const item = lotteryData.find(l => l.loteria === name);
  if (!item) return;

  const brandClass = BRAND_CLASSES[item.loteria] || '';
  const dezenas = item.dezenas || [];

  modalBody.innerHTML = `
    <div class="${brandClass}" style="margin-bottom:20px">
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px">
        <div class="lottery-dot" style="width:20px; height:20px"></div>
        <h2 style="font-size:1.6rem; font-weight:800">${item.loteria}</h2>
        ${item.acumulou ? '<span class="tag-live" style="background:rgba(244,63,94,0.15); color:#f43f5e">ACUMULOU</span>' : ''}
      </div>
      <p style="color:var(--text-muted); font-size:0.9rem">URL da API: <code>${item.url}</code></p>
    </div>

    <!-- Formula Breakdown Box -->
    <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-color); border-radius:12px; padding:18px; margin-bottom:20px">
      <h4 style="font-size:0.95rem; font-weight:700; color:var(--primary-accent); margin-bottom:10px">📐 Demonstração do Cálculo de Vantagem:</h4>
      <div style="font-family:var(--font-mono); font-size:0.9rem; line-height:1.8">
        <div>• <strong>Prêmio Estimado:</strong> ${formatCurrency(item.valorEstimadoProximoConcurso)}</div>
        <div>• <strong>Probabilidade:</strong> ${item.probabilidadeTexto} (${formatScientific(item.probabilidade)})</div>
        <div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border-color); color:var(--emerald-accent); font-weight:800; font-size:1.05rem">
          Retorno Médio = ${item.valorEstimadoProximoConcurso.toLocaleString('pt-BR')} × ${item.probabilidadeTexto} = ${formatCurrency(item.retornoMedio)}
        </div>
      </div>
    </div>

    <!-- Draw Info -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px">
      <div style="background:var(--bg-input); padding:12px; border-radius:10px">
        <span style="font-size:0.75rem; color:var(--text-dim)">Último Concurso</span>
        <div style="font-weight:700; font-size:1.1rem">#${item.concurso || '--'}</div>
      </div>
      <div style="background:var(--bg-input); padding:12px; border-radius:10px">
        <span style="font-size:0.75rem; color:var(--text-dim)">Data do Próximo Sorteio</span>
        <div style="font-weight:700; font-size:1.1rem">${item.dataProximoConcurso || '--'}</div>
      </div>
    </div>

    <!-- Drawn Numbers -->
    ${dezenas.length > 0 ? `
      <div style="margin-bottom:20px">
        <h4 style="font-size:0.9rem; font-weight:700; color:var(--text-muted); margin-bottom:8px">Últimas Dezenas Sorteadas (#${item.concurso}):</h4>
        <div class="dezenas-container">
          ${dezenas.map(d => `<div class="dezena-ball">${d}</div>`).join('')}
        </div>
      </div>
    ` : ''}

    <div style="text-align:right">
      <button class="btn-refresh" style="width:auto; padding:8px 16px; font-size:0.85rem" onclick="window.open('${item.url}', '_blank')">
        Acessar API JSON ↗
      </button>
    </div>
  `;

  detailModal.classList.remove('hidden');
};

function closeModal() {
  detailModal.classList.add('hidden');
}

// UI Event Listeners
btnRefresh.addEventListener('click', () => {
  fetchLotteries(true);
});

searchInput.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  processAndRenderData();
});

sortSelect.addEventListener('change', (e) => {
  currentSort = e.target.value;
  processAndRenderData();
});

chartLotterySelect.addEventListener('change', (e) => {
  selectedChartLottery = e.target.value;
  renderChart();
});

viewGridBtn.addEventListener('click', () => {
  currentView = 'grid';
  viewGridBtn.classList.add('active');
  viewTableBtn.classList.remove('active');
  renderMainList();
});

viewTableBtn.addEventListener('click', () => {
  currentView = 'table';
  viewTableBtn.classList.add('active');
  viewGridBtn.classList.remove('active');
  renderMainList();
});

btnToggleSim.addEventListener('click', () => {
  simulatorSection.classList.toggle('hidden');
});

btnCloseSim.addEventListener('click', () => {
  simulatorSection.classList.add('hidden');
});

simAmountInput.addEventListener('input', (e) => {
  betSimulationAmount = parseFloat(e.target.value) || 1;
  processAndRenderData();
});

document.querySelectorAll('.btn-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = parseFloat(btn.getAttribute('data-val'));
    simAmountInput.value = val;
    betSimulationAmount = val;
    processAndRenderData();
  });
});

modalClose.addEventListener('click', closeModal);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Helpers
function showLoading(show) {
  loadingContainer.style.display = show ? 'grid' : 'none';
  if (show) {
    lotteriesContainer.style.display = 'none';
    podiumSection.style.display = 'none';
  } else {
    lotteriesContainer.style.display = 'block';
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorBox.classList.remove('hidden');
}

function hideError() {
  errorBox.classList.add('hidden');
}

function updateSyncTime(isoString) {
  if (!isoString) return;
  const d = new Date(isoString);
  syncTimeEl.textContent = `Atualizado às ${d.toLocaleTimeString('pt-BR')}`;
}

// Initial Load
fetchLotteries();
