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

export function PodiumSection({ top3, betAmount, onOpenDetail }) {
  if (!top3 || top3.length === 0) return null;

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatProbability = (prob) => {
    if (!prob || isNaN(prob)) return 'N/A';
    const ratio = Math.round(1 / prob);
    return `1 em ${ratio.toLocaleString('pt-BR')}`;
  };

  const maxReturn = top3[0]?.retornoMedio || 1;

  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '20px',
      marginBottom: '28px'
    }}>
      {top3.map((item, index) => {
        const rankNum = index + 1;
        const brandClass = BRAND_CLASSES[item.loteria] || '';
        const progressPercent = Math.min(100, Math.round((item.retornoMedio / maxReturn) * 100));
        const simReturn = item.retornoMedio * betAmount;

        const isRank1 = rankNum === 1;

        return (
          <div 
            key={item.loteria}
            className={`card-surface ${brandClass}`}
            style={{
              position: 'relative',
              padding: '24px',
              border: isRank1 ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
              background: isRank1 ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-surface) 60%)' : 'var(--bg-surface)',
              overflow: 'hidden'
            }}
          >
            {/* Rank Badge */}
            <span style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: rankNum === 1 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : rankNum === 2 ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                : 'linear-gradient(135deg, #b45309, #78350f)',
              color: rankNum === 3 ? '#ffffff' : '#000000',
              boxShadow: rankNum === 1 ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none'
            }}>
              {rankNum === 1 ? '🥇 1º LUGAR VANTAJOSO' : rankNum === 2 ? '🥈 2º LUGAR' : '🥉 3º LUGAR'}
            </span>

            {/* Lottery Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div className="lottery-dot" style={{ width: '16px', height: '16px' }}></div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{item.loteria}</h3>
                {item.acumulou && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: 'var(--accent-rose)',
                    border: '1px solid rgba(244, 63, 94, 0.3)'
                  }}>
                    ACUMULOU! 🔥
                  </span>
                )}
              </div>
            </div>

            {/* Retorno Box */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              padding: '14px 18px',
              borderRadius: '14px',
              marginBottom: '18px'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Retorno Médio por Aposta Base
              </span>
              <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {formatCurrency(item.retornoMedio)}
              </div>
              {betAmount > 1 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginTop: '4px', fontWeight: 600 }}>
                  Simulação R$ {betAmount}: Retorno Médio = {formatCurrency(simReturn)}
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px', fontSize: '0.88rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Prêmio Estimado</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(item.valorEstimadoProximoConcurso)}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Chance de Ganhar</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatProbability(item.probabilidade)}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Próximo Sorteio</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.dataProximoConcurso || 'Em breve'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Concurso</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>#{item.proximoConcurso || '--'}</span>
              </div>
            </div>

            {/* Relative Progress Bar */}
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '18px' }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--accent-emerald), var(--accent-primary))',
                borderRadius: '9999px',
                transition: 'width 0.6s ease'
              }} />
            </div>

            {/* Details Trigger Button */}
            <button 
              className="btn-base btn-secondary"
              onClick={() => onOpenDetail(item)}
              style={{ width: '100%' }}
            >
              <Search size={15} />
              <span>Ver Detalhes e Fórmula</span>
            </button>
          </div>
        );
      })}
    </section>
  );
}
