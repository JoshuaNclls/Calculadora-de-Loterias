import React from 'react';
import { X, ExternalLink, Calculator } from 'lucide-react';

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

export function DetailModal({ item, onClose }) {
  if (!item) return null;

  const brandClass = BRAND_CLASSES[item.loteria] || '';
  const dezenas = item.dezenas || [];

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatScientific = (prob) => {
    if (!prob || isNaN(prob)) return '';
    return prob.toExponential(4);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className={`card-surface ${brandClass}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'var(--text-muted)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Title Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="lottery-dot" style={{ width: '20px', height: '20px' }}></div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.loteria}</h2>
            {item.acumulou && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(244, 63, 94, 0.15)',
                color: 'var(--accent-rose)',
                border: '1px solid rgba(244, 63, 94, 0.3)'
              }}>
                ACUMULOU
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            URL da API: <code style={{ color: 'var(--accent-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.url}</code>
          </p>
        </div>

        {/* Formula Breakdown */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '18px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
            <Calculator size={16} />
            <span>Demonstração do Cálculo de Vantagem:</span>
          </div>
          <div className="font-mono" style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
            <div>• <strong>Prêmio Estimado:</strong> {formatCurrency(item.valorEstimadoProximoConcurso)}</div>
            <div>• <strong>Probabilidade:</strong> {item.probabilidadeTexto} ({formatScientific(item.probabilidade)})</div>
            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px dashed var(--border-subtle)',
              color: 'var(--accent-emerald)',
              fontWeight: 800,
              fontSize: '1.05rem'
            }}>
              Retorno Médio = {item.valorEstimadoProximoConcurso.toLocaleString('pt-BR')} × {item.probabilidadeTexto} = {formatCurrency(item.retornoMedio)}
            </div>
          </div>
        </div>

        {/* Sorteio Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Último Concurso</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>#{item.concurso || '--'}</div>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Data do Próximo Sorteio</span>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{item.dataProximoConcurso || '--'}</div>
          </div>
        </div>

        {/* Dezenas Sorteadas */}
        {dezenas.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Últimas Dezenas Sorteadas (#{item.concurso}):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {dezenas.map((d, i) => (
                <div 
                  key={i}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Action */}
        <div style={{ textAlign: 'right' }}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-base btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            <span>Acessar API JSON</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
