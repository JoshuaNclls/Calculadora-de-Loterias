import React from 'react';
import { Search, LayoutGrid, List, Calculator } from 'lucide-react';

export function ControlsToolbar({
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  isSimOpen,
  onToggleSim
}) {
  return (
    <section className="card-surface" style={{ padding: '16px 20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{
          flex: 1,
          minWidth: '220px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          padding: '10px 14px',
          borderRadius: '12px'
        }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar loteria (ex: Quina, Mega-Sena)..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              width: '100%',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <span>Ordenar:</span>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="retornoMedio-desc">⭐ Retorno Médio (Maior ➔ Menor)</option>
            <option value="valorEstimado-desc">💎 Prêmio Estimado (Maior ➔ Menor)</option>
            <option value="probabilidade-desc">🎯 Probabilidade (Mais Fácil ➔ Mais Difícil)</option>
            <option value="nome-asc">🔤 Nome (A ➔ Z)</option>
          </select>
        </div>

        {/* View Toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-input)',
          borderRadius: '12px',
          padding: '3px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => onViewModeChange('grid')}
            title="Visualização em Cards"
            style={{
              background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-dim)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            title="Visualização em Tabela"
            style={{
              background: viewMode === 'table' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'table' ? '#ffffff' : 'var(--text-dim)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <List size={18} />
          </button>
        </div>

        {/* Simulator Toggle Button */}
        <button
          onClick={onToggleSim}
          style={{
            background: isSimOpen ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.12)',
            color: 'var(--accent-purple)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '10px 16px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Calculator size={16} />
          <span>Simulador</span>
        </button>
      </div>
    </section>
  );
}
