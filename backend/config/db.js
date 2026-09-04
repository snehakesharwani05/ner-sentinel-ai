const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let sqlInstance = null;

let lastDiskMtime = 0;

function checkDiskSync() {
  if (fs.existsSync(dbPath) && sqlInstance) {
    try {
      const stats = fs.statSync(dbPath);
      if (stats.mtimeMs > lastDiskMtime && lastDiskMtime > 0) {
        // Disk changed externally, reload instance
        const SQL = sqlInstance.constructor;
        const fileBuffer = fs.readFileSync(dbPath);
        sqlInstance = new SQL(fileBuffer);
        lastDiskMtime = stats.mtimeMs;
      }
    } catch (e) {}
  }
}

function saveDatabase() {
  if (sqlInstance) {
    const data = sqlInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    try {
      lastDiskMtime = fs.statSync(dbPath).mtimeMs;
    } catch (e) {}
  }
}

const db = {
  async init() {
    const SQL = await initSqlJs();
    let fileBuffer = null;
    if (fs.existsSync(dbPath)) {
      fileBuffer = fs.readFileSync(dbPath);
      try {
        lastDiskMtime = fs.statSync(dbPath).mtimeMs;
      } catch (e) {}
    }
    sqlInstance = new SQL.Database(fileBuffer);
    return this;
  },

  exec(sql) {
    checkDiskSync();
    if (!sqlInstance) throw new Error('Database not initialized');
    sqlInstance.exec(sql);
    saveDatabase();
  },

  prepare(sql) {
    checkDiskSync();
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
