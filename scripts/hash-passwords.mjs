import { readFile, writeFile } from 'node:fs/promises'
import bcrypt from 'bcryptjs'

const path = new URL('../db.json', import.meta.url)
const db = JSON.parse(await readFile(path, 'utf-8'))

for (const user of db.users) {
  if (!user.password.startsWith('$2')) {
    user.password = await bcrypt.hash(user.password, 10)
  }
}

await writeFile(path, JSON.stringify(db, null, 2))
console.log('Passwords hashed')