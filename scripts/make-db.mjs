import { writeFileSync } from 'node:fs'
import { mountains } from '../src/data/mountains.js'

const db = {
  mountains,
  users: [{ id: 1, name: 'Traveler', email: 'traveler@mountains.ua', password: 'mountainpass' }],
  bookings: [],
}
writeFileSync('db.json', JSON.stringify(db, null, 2))