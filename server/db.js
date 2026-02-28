import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vercel's filesystem is read-only except /tmp
const SOURCE_DB = join(__dirname, "digidoc.db");
const DB_PATH = process.env.VERCEL ? "/tmp/digidoc.db" : SOURCE_DB;
const WASM_PATH = join(__dirname, "../node_modules/sql.js/dist/sql-wasm.wasm");

// ── Thin wrapper giving a better-sqlite3-like synchronous API ────────────────
function createWrapper(sqlDb) {
  function persist() {
    writeFileSync(DB_PATH, Buffer.from(sqlDb.export()));
  }

  return {
    exec(sql) {
      sqlDb.run(sql);
      persist();
    },

    /** INSERT / UPDATE / DELETE — returns { lastInsertRowid } */
    run(sql, params = []) {
      sqlDb.run(sql, params);
      const rowid = sqlDb.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] ?? null;
      persist();
      return { lastInsertRowid: rowid };
    },

    /** SELECT — returns the first matching row as a plain object, or null */
    get(sql, params = []) {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const row = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      return row;
    },

    /** SELECT — returns all matching rows as plain objects */
    all(sql, params = []) {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
  };
}

// ── Bootstrap (async, called once at startup) ────────────────────────────────
export async function openDatabase() {
  // On Vercel, the WASM file isn't bundled automatically — load from CDN instead
  const SQL = await initSqlJs({
    locateFile: (file) =>
      process.env.VERCEL
        ? `https://unpkg.com/sql.js@1.12.0/dist/${file}`
        : join(__dirname, `../node_modules/sql.js/dist/${file}`),
  });

  // On Vercel: copy committed DB to /tmp on cold start
  if (process.env.VERCEL && !existsSync(DB_PATH) && existsSync(SOURCE_DB)) {
    copyFileSync(SOURCE_DB, DB_PATH);
  }

  // Load existing DB from disk, or create a fresh one
  const sqlDb = existsSync(DB_PATH)
    ? new SQL.Database(readFileSync(DB_PATH))
    : new SQL.Database();

  const db = createWrapper(sqlDb);

  // ── Schema ────────────────────────────────────────────────────────────────
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    UNIQUE NOT NULL,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'patient',
      first_name  TEXT    DEFAULT '',
      last_name   TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id                TEXT PRIMARY KEY,
      patient_id        INTEGER REFERENCES users(id),
      first_name        TEXT NOT NULL,
      last_name         TEXT NOT NULL,
      age               INTEGER NOT NULL,
      gender            TEXT NOT NULL,
      body_areas        TEXT NOT NULL DEFAULT '[]',
      selected_symptoms TEXT NOT NULL DEFAULT '[]',
      duration          TEXT NOT NULL,
      severity          INTEGER NOT NULL,
      additional_info   TEXT DEFAULT '',
      triage_level      TEXT NOT NULL DEFAULT 'green',
      status            TEXT NOT NULL DEFAULT 'pending-review',
      created_at        TEXT DEFAULT (datetime('now'))
    );
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS gp_actions (
      id            TEXT PRIMARY KEY,
      submission_id TEXT,
      gp_id         INTEGER,
      action_type   TEXT NOT NULL,
      notes         TEXT DEFAULT '',
      created_at    TEXT DEFAULT (datetime('now'))
    );
  `);

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id               TEXT PRIMARY KEY,
      submission_id    TEXT,
      patient_id       INTEGER,
      gp_id            INTEGER,
      hospital         TEXT NOT NULL,
      department       TEXT DEFAULT '',
      doctor           TEXT DEFAULT '',
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      reason           TEXT DEFAULT '',
      status           TEXT NOT NULL DEFAULT 'confirmed',
      notes            TEXT DEFAULT '',
      created_at       TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    );
  `);

  // Persist the freshly created schema
  writeFileSync(DB_PATH, Buffer.from(sqlDb.export()));

  // ── Seed demo accounts ───────────────────────────────────────────────────
  const demoGP = db.get("SELECT id FROM users WHERE email = ?", ["gp@demo.ie"]);
  if (!demoGP) {
    const hash = bcrypt.hashSync("demo1234", 10);
    db.run(
      "INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      ["gp@demo.ie", hash, "gp", "Dr. Sarah", "O'Brien"]
    );
    console.log("✓ Demo GP seeded  →  gp@demo.ie / demo1234");
  }

  const demoPatient = db.get("SELECT id FROM users WHERE email = ?", ["patient@demo.ie"]);
  if (!demoPatient) {
    const hash = bcrypt.hashSync("demo1234", 10);
    db.run(
      "INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      ["patient@demo.ie", hash, "patient", "Rakesh", "Lakshmanan"]
    );
    console.log("✓ Demo Patient seeded  →  patient@demo.ie / demo1234");
  }

  return db;
}
