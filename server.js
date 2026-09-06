const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (handles pkg environment assets path)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Initialize SQLite database
db.initDatabase().catch(err => console.error('Erro ao inicializar SQLite:', err));

// Cache in memory to make responses fast and avoid spamming external API
let cache = {
  timestamp: null,
  data: null
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function fetchLotteryData(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache.data && cache.timestamp && (now - cache.timestamp < CACHE_TTL_MS)) {
    return cache.data;
  }

  const lotJsonPath = path.join(__dirname, 'lot.json');
  if (!fs.existsSync(lotJsonPath)) {
    throw new Error('Arquivo lot.json não encontrado no servidor.');
  }

  const rawLotData = JSON.parse(fs.readFileSync(lotJsonPath, 'utf8'));

  // Fetch all APIs concurrently
  const promises = rawLotData.map(async (item) => {
    const loteriaName = item.Loteria || item.Loterias;
    const probNum = parseFloat(item.Probabilidade);
    const url = item.URL;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const apiData = await response.json();

      const valorEstimado = parseFloat(apiData.valorEstimadoProximoConcurso) || 0;
      const retornoMedio = valorEstimado * probNum;

      const lotteryObj = {
        loteria: loteriaName,
        probabilidade: probNum,
        probabilidadeTexto: item.Probabilidade,
        url: url,
        valorEstimadoProximoConcurso: valorEstimado,
        retornoMedio: retornoMedio,
        acumulou: apiData.acumulou || false,
        concurso: apiData.concurso || null,
        proximoConcurso: apiData.proximoConcurso || null,
        dataProximoConcurso: apiData.dataProximoConcurso || null,
        dezenas: apiData.dezenas || [],
        premiacoes: apiData.premiacoes || [],
        valorAcumuladoProximoConcurso: apiData.valorAcumuladoProximoConcurso || 0,
        apiDataRaw: apiData,
        error: null
      };

      // Save live snapshot to SQLite async
      db.saveSnapshot(lotteryObj).catch(e => console.error('Erro ao salvar snapshot:', e.message));

      return lotteryObj;
    } catch (err) {
      console.warn(`Aviso: Falha na API remota para ${loteriaName} (${err.message}). Buscando último snapshot no SQLite...`);
      
      // Offline / Error Fallback from SQLite Database
      const localHistory = await db.getHistory(loteriaName);
      const lastRecord = localHistory && localHistory.length > 0 ? localHistory[localHistory.length - 1] : null;

      const valorEstimado = lastRecord ? lastRecord.valor_estimado : 0;
      const retornoMedio = lastRecord ? lastRecord.retorno_medio : 0;

      return {
        loteria: loteriaName,
        probabilidade: probNum,
        probabilidadeTexto: item.Probabilidade,
        url: url,
        valorEstimadoProximoConcurso: valorEstimado,
        retornoMedio: retornoMedio,
        acumulou: lastRecord ? Boolean(lastRecord.acumulou) : false,
        concurso: lastRecord ? lastRecord.concurso : null,
        proximoConcurso: lastRecord ? lastRecord.concurso : null,
        dataProximoConcurso: 'Modo Offline (SQLite)',
        dezenas: [],
        premiacoes: [],
        valorAcumuladoProximoConcurso: 0,
        apiDataRaw: null,
        error: `Servidor em modo offline: ${err.message}`
      };
    }
  });

  const results = await Promise.all(promises);

  // Sort by retornoMedio descending
  results.sort((a, b) => b.retornoMedio - a.retornoMedio);

  // Assign ranks
  const rankedResults = results.map((item, index) => ({
    rank: index + 1,
    ...item
  }));

  cache = {
    timestamp: now,
    data: {
      updatedAt: new Date(now).toISOString(),
      lotteries: rankedResults
    }
  };

  return cache.data;
}

// API Endpoints
app.get('/api/loterias', async (req, res) => {
  try {
    const force = req.query.refresh === 'true';
    const data = await fetchLotteryData(force);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for historical timeline chart data
app.get('/api/historico', async (req, res) => {
  try {
    const loteria = req.query.loteria;
    if (loteria) {
      const data = await db.getHistory(loteria);
      res.json(data);
    } else {
      const grouped = await db.getHistoryGrouped();
      res.json(grouped);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/lot-json', (req, res) => {
  const lotJsonPath = path.join(__dirname, 'lot.json');
  if (fs.existsSync(lotJsonPath)) {
    res.sendFile(lotJsonPath);
  } else {
    res.status(404).json({ error: 'lot.json not found' });
  }
});

// Fallback route to serve index.html for unknown routes
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LotoVantagem - Servidor Executável Ativo!`);
  console.log(`📍 Acesse no navegador: http://localhost:${PORT}`);
  console.log(`=======================================================`);

  // Automatically open browser on Windows when launched as executable
  if (process.platform === 'win32') {
    exec(`start http://localhost:${PORT}`);
  }
});
