const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Store loterias.db in process.cwd() so it works both in development and packaged executable (.exe)
const dbPath = path.join(process.cwd(), 'loterias.db');
const db = new sqlite3.Database(dbPath);

// Helper for Promisified Queries
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize Database Tables
async function initDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS snapshots_historicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loteria TEXT NOT NULL,
      data_registro TEXT NOT NULL,
      concurso INTEGER,
      valor_estimado REAL NOT NULL,
      retorno_medio REAL NOT NULL,
      probabilidade REAL NOT NULL,
      acumulou INTEGER DEFAULT 0
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS resultados_concursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loteria TEXT NOT NULL,
      concurso INTEGER UNIQUE,
      data_sorteio TEXT,
      dezenas TEXT,
      valor_estimado REAL,
      retorno_medio REAL
    )
  `);

  // Deduplicate existing records: keep only the latest record per lottery per calendar date
  await dbRun(`
    DELETE FROM snapshots_historicos
    WHERE id NOT IN (
      SELECT MAX(id)
      FROM snapshots_historicos
      GROUP BY loteria, strftime('%Y-%m-%d', data_registro)
    )
  `);

  // Check if historical seed data exists; if empty, populate initial historical timeline
  const countRow = await dbAll(`SELECT COUNT(*) as count FROM snapshots_historicos`);
  if (countRow[0].count === 0) {
    console.log('🌱 Populando histórico inicial no SQLite...');
    await seedHistoricalData();
  }
}

// Populate realistic historical trend points for the past 8 weeks (1 record per date)
async function seedHistoricalData() {
  const lotJsonPath = path.join(__dirname, 'lot.json');
  if (!fs.existsSync(lotJsonPath)) return;

  const lotteries = JSON.parse(fs.readFileSync(lotJsonPath, 'utf8'));
  const now = new Date();

  // Multipliers representing jackpot accumulation progression over 8 weeks
  const multipliers = [0.35, 0.45, 0.60, 0.40, 0.75, 0.85, 0.95, 1.0];

  for (const item of lotteries) {
    const lotName = item.Loteria || item.Loterias;
    const prob = parseFloat(item.Probabilidade);

    // Baseline current prizes
    const basePrizes = {
      'Mega-Sena': 62000000,
      'Quina': 14000000,
      'Lotofácil': 2000000,
      'Super Sete': 3900000,
      'Lotomania': 2900000,
      'Dupla Sena': 1700000,
      'Timemania': 4700000,
      'Dia de Sorte': 250000,
      '+Milionária': 76000000
    };

    const maxPrize = basePrizes[lotName] || 5000000;

    for (let week = 7; week >= 0; week--) {
      const date = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000);
      const mult = multipliers[7 - week];
      const estimatedValue = Math.round(maxPrize * mult);
      const retornoMedio = estimatedValue * prob;
      const concursoFake = 2800 - (week * 2);

      await dbRun(
        `INSERT INTO snapshots_historicos (loteria, data_registro, concurso, valor_estimado, retorno_medio, probabilidade, acumulou)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [lotName, date.toISOString(), concursoFake, estimatedValue, retornoMedio, prob, mult > 0.6 ? 1 : 0]
      );
    }
  }
  console.log('✅ Histórico inicial criado com sucesso no SQLite!');
}

// Save Live Snapshot (Upsert: Update if same date exists, else Insert)
async function saveSnapshot(lotteryItem) {
  const { loteria, valorEstimadoProximoConcurso, retornoMedio, probabilidade, acumulou, proximoConcurso } = lotteryItem;
  if (!loteria || valorEstimadoProximoConcurso === undefined) return;

  const todayStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Check if a record for this lottery on this date already exists
  const existing = await dbAll(
    `SELECT id FROM snapshots_historicos 
     WHERE loteria = ? AND strftime('%Y-%m-%d', data_registro) = ?`,
    [loteria, todayStr]
  );

  if (existing && existing.length > 0) {
    // Update existing record for today instead of creating a duplicate row
    await dbRun(
      `UPDATE snapshots_historicos 
       SET valor_estimado = ?, retorno_medio = ?, probabilidade = ?, acumulou = ?, concurso = ?, data_registro = ?
       WHERE id = ?`,
      [
        valorEstimadoProximoConcurso,
        retornoMedio,
        probabilidade,
        acumulou ? 1 : 0,
        proximoConcurso || null,
        new Date().toISOString(),
        existing[0].id
      ]
    );
  } else {
    // Insert new record for new date
    await dbRun(
      `INSERT INTO snapshots_historicos (loteria, data_registro, concurso, valor_estimado, retorno_medio, probabilidade, acumulou)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        loteria,
        new Date().toISOString(),
        proximoConcurso || null,
        valorEstimadoProximoConcurso,
        retornoMedio,
        probabilidade,
        acumulou ? 1 : 0
      ]
    );
  }
}

// Get Historical Snapshots for Charts (1 record per date)
async function getHistory(loteria = null) {
  if (loteria) {
    return await dbAll(
      `SELECT * FROM snapshots_historicos 
       WHERE loteria = ? AND id IN (
         SELECT MAX(id) FROM snapshots_historicos WHERE loteria = ? GROUP BY strftime('%Y-%m-%d', data_registro)
       )
       ORDER BY data_registro ASC`,
      [loteria, loteria]
    );
  }
  return await dbAll(
    `SELECT * FROM snapshots_historicos 
     WHERE id IN (
       SELECT MAX(id) FROM snapshots_historicos GROUP BY loteria, strftime('%Y-%m-%d', data_registro)
     )
     ORDER BY data_registro ASC`
  );
}

// Get Data grouped by Lottery for Multi-line Chart (1 record per date per lottery)
async function getHistoryGrouped() {
  const rows = await dbAll(
    `SELECT * FROM snapshots_historicos 
     WHERE id IN (
       SELECT MAX(id) FROM snapshots_historicos GROUP BY loteria, strftime('%Y-%m-%d', data_registro)
     )
     ORDER BY data_registro ASC`
  );

  const grouped = {};

  rows.forEach(r => {
    if (!grouped[r.loteria]) {
      grouped[r.loteria] = [];
    }
    grouped[r.loteria].push({
      date: r.data_registro,
      concurso: r.concurso,
      valorEstimado: r.valor_estimado,
      retornoMedio: r.retorno_medio,
      acumulou: Boolean(r.acumulou)
    });
  });

  return grouped;
}

module.exports = {
  initDatabase,
  saveSnapshot,
  getHistory,
  getHistoryGrouped
};
