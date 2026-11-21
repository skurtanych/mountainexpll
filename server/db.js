import { readFile, writeFile } from 'node:fs/promises'

const DB_PATH = new URL('../db.json', import.meta.url)

export async function readDb() {
  return JSON.parse(await readFile(DB_PATH, 'utf-8'))
}

export async function writeDb(db) {
  await writeFile(DB_PATH, JSON.stringify(db, null, 2))
}
