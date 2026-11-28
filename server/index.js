import bcrypt from 'bcryptjs'
import cors from 'cors'
import express from 'express'
import { authRequired, signToken } from './auth.js'
import { readDb, writeDb } from './db.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

const publicUser = ({ id, name, email }) => ({ id, name, email })
const nextId = (items) => items.reduce((max, i) => Math.max(max, Number(i.id) || 0), 0) + 1

app.get('/mountains', async (req, res) => {
  const db = await readDb()
  res.json(db.mountains)
})

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const db = await readDb()
  const normalizedEmail = email.trim().toLowerCase()

  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ message: 'Email is already registered' })
  }

  const user = {
    id: nextId(db.users),
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
  }

  db.users.push(user)
  await writeDb(db)
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' })
  }

  const db = await readDb()
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  const passwordOk = user && (await bcrypt.compare(password, user.password))

  if (!passwordOk) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  res.json({ token: signToken(user), user: publicUser(user) })
})

app.get('/bookings', authRequired, async (req, res) => {
  const db = await readDb()
  res.json(db.bookings.filter((b) => b.userId === req.user.id))
})

app.post('/bookings', authRequired, async (req, res) => {
  const { mountain, date } = req.body

  if (!mountain || !date) {
    return res.status(400).json({ message: 'mountain and date are required' })
  }

  const db = await readDb()

  const duplicate = db.bookings.some(
    (b) => b.userId === req.user.id && b.mountain === mountain && b.date === date,
  )
  if (duplicate) {
    return res.status(409).json({ message: 'You already booked this mountain for this date' })
  }

  const booking = {
    id: nextId(db.bookings),
    userId: req.user.id,
    mountain,
    date,
    status: 'pending',
  }

  db.bookings.push(booking)
  await writeDb(db)
  res.status(201).json(booking)
})
app.delete('/bookings/:id', authRequired, async (req, res) => {
  const db = await readDb()
  const booking = db.bookings.find((b) => String(b.id) === req.params.id)

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' })
  }
  if (booking.userId !== req.user.id) {
    return res.status(403).json({ message: 'You can only cancel your own bookings' })
  }

  db.bookings = db.bookings.filter((b) => String(b.id) !== req.params.id)
  await writeDb(db)
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`)
})
