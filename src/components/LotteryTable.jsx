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

export function LotteryTable({ lotteries, onOpenDetail }) {
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
    <div className="card-surface" style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border-subtle)' }}>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Rank</th>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Loteria</th>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Retorno Médio</th>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Prêmio Estimado</th>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Probabilidade</th>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Próximo Sorteio</th>
            <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {lotteries.map(item => {
            const brandClass = BRAND_CLASSES[item.loteria] || '';

            return (
              <tr 
                key={item.loteria}
                className={brandClass}
                style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s ease' }}
              >
                <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--text-muted)' }}>#{item.rank}</td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                    <div className="lottery-dot"></div>
                    <span>{item.loteria}</span>
                    {item.acumulou && (
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        background: 'rgba(244, 63, 94, 0.15)',
                        color: 'var(--accent-rose)',
                        border: '1px solid rgba(244, 63, 94, 0.3)'
                      }}>
                        ACUMULOU
                      </span>
                    )}
                  </div>
                </td>
                <td className="font-mono" style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '1rem' }}>
                  {formatCurrency(item.retornoMedio)}
                </td>
                <td className="font-mono" style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatCurrency(item.valorEstimadoProximoConcurso)}
                </td>
                <td className="font-mono" style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {formatProbability(item.probabilidade)}
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--text-main)' }}>
                  {item.dataProximoConcurso || '--'}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button
                    className="btn-base btn-secondary"
                    onClick={() => onOpenDetail(item)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <Search size={13} />
                    <span>Detalhes</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
