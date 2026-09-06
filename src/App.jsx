import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { FormulaBanner } from './components/FormulaBanner';
import { MetricsGrid } from './components/MetricsGrid';
import { PodiumSection } from './components/PodiumSection';
import { HistoryChartSection } from './components/HistoryChartSection';
import { ControlsToolbar } from './components/ControlsToolbar';
import { SimulatorDrawer } from './components/SimulatorDrawer';
import { LotteryGrid } from './components/LotteryGrid';
import { LotteryTable } from './components/LotteryTable';
import { DetailModal } from './components/DetailModal';

export function App() {
  const [lotteryData, setLotteryData] = useState([]);
  const [historyData, setHistoryData] = useState({});
  const [syncTime, setSyncTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('retornoMedio-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [isSimOpen, setIsSimOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(10);

  const [selectedDetailLottery, setSelectedDetailLottery] = useState(null);

  // Fetch Live Data
  const fetchLotteries = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    setErrorMessage(null);

    try {
      let data;
      try {
        const res = await fetch(`/api/loterias${forceRefresh ? '?refresh=true' : ''}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
        setLotteryData(data.lotteries || []);
        setSyncTime(data.updatedAt);
      } catch (err) {
        console.warn('Backend Express indisponível. Tentando fallback direto...', err.message);
        data = await fetchFallbackDirect();
        setLotteryData(data);
        setSyncTime(new Date().toISOString());
      }

      await fetchHistory();
    } catch (err) {
      setErrorMessage(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Direct Fallback if opened standalone
  const fetchFallbackDirect = async () => {
    const resLot = await fetch('/lot-json');
    const rawList = await resLot.json();

    const promises = rawList.map(async (item) => {
      const name = item.Loteria || item.Loterias;
      const prob = parseFloat(item.Probabilidade);
      try {
        const res = await fetch(item.URL);
        const apiData = await res.json();
        const val = parseFloat(apiData.valorEstimadoProximoConcurso) || 0;
        return {
          loteria: name,
          probabilidade: prob,
          probabilidadeTexto: item.Probabilidade,
          url: item.URL,
          valorEstimadoProximoConcurso: val,
          retornoMedio: val * prob,
          acumulou: apiData.acumulou || false,
          concurso: apiData.concurso || null,
          proximoConcurso: apiData.proximoConcurso || null,
          dataProximoConcurso: apiData.dataProximoConcurso || null,
          dezenas: apiData.dezenas || [],
          premiacoes: apiData.premiacoes || [],
          valorAcumuladoProximoConcurso: apiData.valorAcumuladoProximoConcurso || 0
        };
      } catch (e) {
        return {
          loteria: name,
          probabilidade: prob,
          probabilidadeTexto: item.Probabilidade,
          url: item.URL,
          valorEstimadoProximoConcurso: 0,
          retornoMedio: 0,
          error: e.message
        };
      }
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => b.retornoMedio - a.retornoMedio);
    return results.map((item, idx) => ({ rank: idx + 1, ...item }));
  };

  // Fetch SQLite History Data
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/historico');
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico:', e.message);
    }
  };

  useEffect(() => {
    fetchLotteries();
  }, []);

  // Filtered & Sorted Lotteries
  const filteredLotteries = useMemo(() => {
    let list = lotteryData.filter(item =>
      item.loteria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.sort((a, b) => {
      switch (sortOption) {
        case 'retornoMedio-desc':
          return b.retornoMedio - a.retornoMedio;
        case 'valorEstimado-desc':
          return b.valorEstimadoProximoConcurso - a.valorEstimadoProximoConcurso;
        case 'probabilidade-desc':
          return b.probabilidade - a.probabilidade;
        case 'nome-asc':
          return a.loteria.localeCompare(b.loteria);
        default:
          return b.retornoMedio - a.retornoMedio;
      }
    });

    return list;
  }, [lotteryData, searchTerm, sortOption]);

  const topLottery = useMemo(() => {
    if (!lotteryData.length) return null;
    return [...lotteryData].sort((a, b) => b.retornoMedio - a.retornoMedio)[0];
  }, [lotteryData]);

  const highestPrizeLottery = useMemo(() => {
    if (!lotteryData.length) return null;
    return [...lotteryData].sort((a, b) => b.valorEstimadoProximoConcurso - a.valorEstimadoProximoConcurso)[0];
  }, [lotteryData]);

  const top3Podium = useMemo(() => {
    if (searchTerm || sortOption !== 'retornoMedio-desc') return [];
    return [...lotteryData].sort((a, b) => b.retornoMedio - a.retornoMedio).slice(0, 3);
  }, [lotteryData, searchTerm, sortOption]);

  const maxReturn = topLottery ? topLottery.retornoMedio : 1;

  return (
    <div className="app-wrapper">
      {/* Header */}
      <Header
        syncTime={syncTime}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchLotteries(true)}
      />

      <main>
        {/* Formula Explanation Banner */}
        <FormulaBanner topReturn={topLottery ? topLottery.retornoMedio : 0.2064} />

        {/* Top Summary Metrics */}
        <MetricsGrid
          topLottery={topLottery}
          highestPrizeLottery={highestPrizeLottery}
          totalCount={lotteryData.length}
        />

        {/* Historical Line Chart */}
        <HistoryChartSection historyData={historyData} />

        {/* Controls & Filter Bar */}
        <ControlsToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isSimOpen={isSimOpen}
          onToggleSim={() => setIsSimOpen(prev => !prev)}
        />

        {/* Bet ROI Simulator Drawer */}
        <SimulatorDrawer
          isOpen={isSimOpen}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          onClose={() => setIsSimOpen(false)}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid var(--accent-rose)',
            color: 'var(--accent-rose)',
            padding: '16px',
            borderRadius: '14px',
            marginBottom: '20px'
          }}>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="skeleton" style={{ height: '220px' }}></div>
            <div className="skeleton" style={{ height: '220px' }}></div>
            <div className="skeleton" style={{ height: '220px' }}></div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <PodiumSection
              top3={top3Podium}
              betAmount={betAmount}
              onOpenDetail={(item) => setSelectedDetailLottery(item)}
            />

            {/* Main Lotteries Display */}
            {viewMode === 'grid' ? (
              <LotteryGrid
                lotteries={filteredLotteries}
                maxReturn={maxReturn}
                onOpenDetail={(item) => setSelectedDetailLottery(item)}
              />
            ) : (
              <LotteryTable
                lotteries={filteredLotteries}
                onOpenDetail={(item) => setSelectedDetailLottery(item)}
              />
            )}
          </>
        )}
      </main>

      {/* Details Modal */}
      <DetailModal
        item={selectedDetailLottery}
        onClose={() => setSelectedDetailLottery(null)}
      />

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-dim)'
      }}>
        <p>Desenvolvido com <strong>Vite + React</strong>, SQLite Local e API Oficial Loterias Caixa.</p>
        <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Aviso: O Retorno Médio é uma métrica puramente matemática de valor esperado ($EV$). Loterias são jogos de azar e não constituem investimento financeiro.
        </p>
      </footer>
    </div>
  );
}
