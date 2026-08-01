import { readdir, readFile } from 'node:fs/promises'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('DATABASE_URL_UNPOOLED of DATABASE_URL ontbreekt. Maak eerst .env.local aan op basis van .env.example.')
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, prepare: false, connect_timeout: 10 })
try {
  const directory = new URL('../database/', import.meta.url)
  const migrations = (await readdir(directory)).filter((file) => /^\d+_.+\.sql$/.test(file)).sort()
  for (const file of migrations) {
    const migration = await readFile(new URL(file, directory), 'utf8')
    await sql.unsafe(migration)
    console.log(`Migratie ${file} is veilig uitgevoerd.`)
  }
} catch (error) {
  console.error('Migratie afgebroken; PostgreSQL heeft de transactie teruggedraaid.')
  if (process.env.NODE_ENV !== 'production' && error instanceof Error) console.error(error.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
