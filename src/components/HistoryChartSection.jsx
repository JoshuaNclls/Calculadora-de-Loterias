import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LineChart, Filter } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BRAND_COLORS = {
  'Mega-Sena': '#10b981',
  'Quina': '#8b5cf6',
  'Lotofácil': '#ec4899',
  'Super Sete': '#84cc16',
  'Lotomania': '#f97316',
  'Dupla Sena': '#ef4444',
  'Timemania': '#eab308',
  'Dia de Sorte': '#f59e0b',
  '+Milionária': '#3b82f6'
};

export function HistoryChartSection({ historyData }) {
  const [selectedLottery, setSelectedLottery] = useState('ALL');

  if (!historyData || Object.keys(historyData).length === 0) return null;

  const lotteryKeys = selectedLottery === 'ALL'
    ? Object.keys(historyData)
    : [selectedLottery];

  // 1. Collect unique dates chronologically
  const dateMap = new Map();
  lotteryKeys.forEach(lotName => {
    const records = historyData[lotName] || [];
    records.forEach(r => {
      if (r.date) {
        const isoDate = r.date.split('T')[0];
        if (!dateMap.has(isoDate)) {
          const parts = isoDate.split('-');
          const dayMonth = parts.length === 3 ? `${parts[2]}/${parts[1]}` : isoDate;
          dateMap.set(isoDate, dayMonth);
        }
      }
    });
  });

  const sortedIsoDates = Array.from(dateMap.keys()).sort();
  const labels = sortedIsoDates.map(iso => dateMap.get(iso));

  // 2. Build datasets
  const datasets = lotteryKeys.map(lotName => {
    const records = historyData[lotName] || [];
    const recordByDate = {};
    records.forEach(r => {
      if (r.date) {
        const iso = r.date.split('T')[0];
        recordByDate[iso] = r.retornoMedio;
      }
    });

    const dataPoints = sortedIsoDates.map(iso => recordByDate[iso] !== undefined ? recordByDate[iso] : null);
    const color = BRAND_COLORS[lotName] || '#3b82f6';

    return {
      label: lotName,
      data: dataPoints,
      borderColor: color,
      backgroundColor: color + '22',
      borderWidth: 2.5,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      spanGaps: true,
      fill: selectedLottery !== 'ALL'
    };
  });

  const chartData = {
    labels: labels,
    datasets: datasets
  };

  const chartOptions = {
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
          color: '#9ca3af',
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f9fafb',
        bodyColor: '#10b981',
        borderColor: 'rgba(255, 255, 255, 0.16)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            const val = context.parsed.y;
            const formatted = val !== null && val !== undefined
              ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
              : 'R$ 0,00';
            return `${context.dataset.label}: ${formatted}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#6b7280' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#6b7280',
          callback: function(val) {
            return 'R$ ' + val.toFixed(2);
          }
        }
      }
    }
  };

  return (
    <section style={{ marginBottom: '28px' }}>
      <div className="card-surface" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LineChart size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Evolução do Retorno Médio (Histórico SQLite)</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Variação do Retorno Médio ao longo do tempo (1 registro desduplicado por data).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <Filter size={16} />
            <span>Filtrar:</span>
            <select
              value={selectedLottery}
              onChange={(e) => setSelectedLottery(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">🌟 Todas as Loterias</option>
              {Object.keys(historyData).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ position: 'relative', height: '320px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </section>
  );
}
