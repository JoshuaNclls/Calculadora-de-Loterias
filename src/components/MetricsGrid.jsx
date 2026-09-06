import React from 'react';
import { Trophy, DollarSign, Database } from 'lucide-react';

export function MetricsGrid({ topLottery, highestPrizeLottery, totalCount }) {
  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '28px'
    }}>
      {/* Top 1 Vantagem */}
      <div className="card-surface" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '18px', borderLeft: '4px solid var(--accent-amber)' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'rgba(245, 158, 11, 0.15)',
          color: 'var(--accent-amber)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Trophy size={26} />
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Campeão de Vantagem (#1)</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0', color: 'var(--text-main)' }}>
            {topLottery ? topLottery.loteria : '--'}
          </h2>
          <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
            {topLottery ? `${formatCurrency(topLottery.retornoMedio)} por aposta base` : 'Calculando...'}
          </span>
        </div>
      </div>

      {/* Maior Premio Estimado */}
      <div className="card-surface" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '18px', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--accent-emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <DollarSign size={26} />
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Maior Prêmio Estimado</span>
          <h2 className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0', color: 'var(--text-main)' }}>
            {highestPrizeLottery ? formatCurrency(highestPrizeLottery.valorEstimadoProximoConcurso) : 'R$ --'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
            {highestPrizeLottery ? `${highestPrizeLottery.loteria} ${highestPrizeLottery.acumulou ? '🔥 Acumulou' : ''}` : '--'}
          </span>
        </div>
      </div>

      {/* Persistencia SQLite */}
      <div className="card-surface" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '18px', borderLeft: '4px solid var(--accent-primary)' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'rgba(59, 130, 246, 0.15)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Database size={26} />
        </div>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Banco de Dados SQLite</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0', color: 'var(--text-main)' }}>
            {totalCount || 9} Loterias
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Histórico & Modo Offline Ativo
          </span>
        </div>
      </div>
    </section>
  );
}
