import React from 'react';
import { TrendingUp, RotateCw, CheckCircle2 } from 'lucide-react';

export function Header({ syncTime, isRefreshing, onRefresh }) {
  const formattedTime = syncTime 
    ? new Date(syncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Sincronizando...';

  return (
    <header className="card-surface" style={{ padding: '20px 28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)'
          }}>
            <TrendingUp size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                LotoVantagem
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                letterSpacing: '0.05em'
              }}>
                VITE + REACT
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Ranking Matemático de Vantagem das Loterias Caixa por Retorno Médio ($EV$)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '8px 14px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)'
          }}>
            <span className="pulse-dot"></span>
            <span>Atualizado às {formattedTime}</span>
          </div>

          <button 
            className="btn-base btn-primary"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{ opacity: isRefreshing ? 0.7 : 1 }}
          >
            <RotateCw size={16} className={isRefreshing ? 'spin-anim' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
