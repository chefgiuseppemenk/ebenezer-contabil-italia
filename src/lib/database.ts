import { createClient } from "@libsql/client";

const db = createClient({
  url: "file:local.db",
});

export async function initDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS movimenti (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('entrata', 'uscita')),
      settore TEXT NOT NULL CHECK(settore IN ('bar', 'libreria', 'decima_offerta')),
      metodo_pagamento TEXT NOT NULL CHECK(metodo_pagamento IN ('sumup', 'contanti', 'paypal')),
      descrizione TEXT NOT NULL,
      importo REAL NOT NULL CHECK(importo > 0),
      categoria TEXT NOT NULL CHECK(categoria IN ('donazioni', 'affitto', 'utenze', 'stipendi', 'forniture', 'manutenzione', 'eventi', 'altro')),
      data DATE NOT NULL DEFAULT (date('now')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_movimenti_user_id ON movimenti(user_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_movimenti_data ON movimenti(data DESC)
  `);
}

export async function getMovements(userId: string) {
  const result = await db.execute({
    sql: "SELECT * FROM movimenti WHERE user_id = ? ORDER BY data DESC, created_at DESC",
    args: [userId],
  });
  return result.rows;
}

export async function insertMovement(movement: {
  id: string;
  user_id: string;
  tipo: string;
  settore: string;
  metodo_pagamento: string;
  descrizione: string;
  importo: number;
  categoria: string;
}) {
  await db.execute({
    sql: `INSERT INTO movimenti (id, user_id, tipo, settore, metodo_pagamento, descrizione, importo, categoria, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'))`,
    args: [
      movement.id,
      movement.user_id,
      movement.tipo,
      movement.settore,
      movement.metodo_pagamento,
      movement.descrizione,
      movement.importo,
      movement.categoria,
    ],
  });
}

export async function deleteMovement(id: string, userId: string) {
  await db.execute({
    sql: "DELETE FROM movimenti WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
}

export async function createUser(id: string, email: string) {
  await db.execute({
    sql: "INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)",
    args: [id, email],
  });
}

export async function getUserByEmail(email: string) {
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email],
  });
  return result.rows[0] || null;
}

export { db };
