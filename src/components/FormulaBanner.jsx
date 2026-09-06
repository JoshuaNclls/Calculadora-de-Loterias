import React from 'react';
import { Calculator } from 'lucide-react';

export function FormulaBanner({ topReturn }) {
  const formattedTop = topReturn !== undefined && topReturn !== null
    ? topReturn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,2064';

  return (
    <section style={{ marginBottom: '24px' }}>
      <div 
        className="card-surface" 
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
          borderColor: 'rgba(59, 130, 246, 0.25)',
          padding: '22px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
            background: 'rgba(59, 130, 246, 0.12)',
            padding: '4px 10px',
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <Calculator size={13} />
            <span>Fórmula de Cálculo Estatístico</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>Como calculamos o Retorno Médio ($EV$)?</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '560px' }}>
            O <strong>Retorno Médio Esperado</strong> indica o valor estatístico retornado para cada aposta efetuada, calculando o prêmio estimado multiplicado pela probabilidade oficial de vitória.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '12px 20px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px' }}>Retorno Médio (R$)</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{formattedTop}</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dim)' }}>=</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px' }}>Prêmio Estimado</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>valorEstimado</span>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dim)' }}>×</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px' }}>Probabilidade</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Probabilidade (`lot.json`)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
