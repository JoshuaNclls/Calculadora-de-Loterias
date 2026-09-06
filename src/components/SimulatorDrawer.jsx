import React from 'react';
import { X, Calculator } from 'lucide-react';

export function SimulatorDrawer({ isOpen, betAmount, onBetAmountChange, onClose }) {
  if (!isOpen) return null;

  const presets = [5, 10, 50, 100];

  return (
    <section style={{ marginBottom: '24px' }}>
      <div 
        className="card-surface" 
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calculator size={20} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Simulador de Retorno de Aposta</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Simule quanto de retorno estatístico médio você obtém com um valor de investimento personalizado.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Valor total investido (R$):
          </label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1px solid var(--accent-purple)',
            borderRadius: '12px',
            padding: '8px 14px',
            fontWeight: 700,
            gap: '6px'
          }}>
            <span style={{ color: 'var(--accent-purple)' }}>R$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={betAmount}
              onChange={(e) => onBetAmountChange(parseFloat(e.target.value) || 1)}
              className="font-mono"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1.1rem',
                width: '100px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {presets.map(val => (
              <button
                key={val}
                onClick={() => onBetAmountChange(val)}
                style={{
                  background: betAmount === val ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  border: betAmount === val ? '1px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                R$ {val}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
