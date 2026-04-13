// Run migration 000010 directly using the DATABASE_URL from .env
import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const sql = readFileSync(
  join(__dirname, '../db/migrations/000010_rental_pricing_and_biometrics.sql'),
  'utf8'
)

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

await client.connect()
console.log('Connected to database.')

try {
  await client.query(sql)
  console.log('✅ Migration 000010 applied successfully.')
} catch (err) {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
