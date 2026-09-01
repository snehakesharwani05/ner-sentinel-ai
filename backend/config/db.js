const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let sqlInstance = null;

function saveDatabase() {
  if (sqlInstance) {
    const data = sqlInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Load or create SQLite WASM instance
function getSqlInstance() {
  if (!sqlInstance) {
    // Synchronous execution using cached instance if available or load file
    let fileBuffer = null;
    if (fs.existsSync(dbPath)) {
      fileBuffer = fs.readFileSync(dbPath);
    }
    // We initialize sql.js synchronously using require('sql.js') init
    // Note: initSqlJs returns a Promise, but we can handle it cleanly or load sync
    throw new Error('Database not initialized. Call await db.init() first.');
  }
  return sqlInstance;
}

const db = {
  async init() {
    const SQL = await initSqlJs();
    let fileBuffer = null;
    if (fs.existsSync(dbPath)) {
      fileBuffer = fs.readFileSync(dbPath);
    }
    sqlInstance = new SQL.Database(fileBuffer);
    return this;
  },

  exec(sql) {
    if (!sqlInstance) throw new Error('Database not initialized');
    sqlInstance.exec(sql);
    saveDatabase();
  },

  prepare(sql) {
    if (!sqlInstance) throw new Error('Database not initialized');
    return {
      all(...params) {
        const stmt = sqlInstance.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },

      get(...params) {
        const stmt = sqlInstance.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        let result = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },

      run(...params) {
        const stmt = sqlInstance.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        stmt.step();
        stmt.free();
        saveDatabase();
        return { changes: 1 };
      }
    };
  }
};

module.exports = db;
