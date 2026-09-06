import React from 'react';
import { Search } from 'lucide-react';

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

export function LotteryGrid({ lotteries, maxReturn, onOpenDetail }) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatProbability = (prob) => {
    if (!prob || isNaN(prob)) return 'N/A';
    const ratio = Math.round(1 / prob);
    return `1 em ${ratio.toLocaleString('pt-BR')}`;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    }}>
      {lotteries.map(item => {
        const brandClass = BRAND_CLASSES[item.loteria] || '';
        const progressPercent = Math.min(100, Math.round((item.retornoMedio / (maxReturn || 1)) * 100));

        return (
          <div 
            key={item.loteria}
            className={`card-surface ${brandClass}`}
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="lottery-dot"></div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{item.loteria}</h3>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  color: 'var(--text-muted)'
                }}>
                  Rank #{item.rank}
                </span>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Retorno Médio
                </span>
                <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {formatCurrency(item.retornoMedio)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Prêmio Estimado</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(item.valorEstimadoProximoConcurso)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Probabilidade</span>
                  <span className="font-mono" style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>{formatProbability(item.probabilidade)}</span>
                </div>
              </div>

              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-primary))',
                  borderRadius: '9999px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>

            <button 
              className="btn-base btn-secondary"
              onClick={() => onOpenDetail(item)}
              style={{ width: '100%' }}
            >
              <Search size={14} />
              <span>Ver Estatísticas</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
