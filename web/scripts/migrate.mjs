#!/usr/bin/env node
/**
 * Run Supabase migration via Management API
 * Usage: SUPABASE_ACCESS_TOKEN=xxx node scripts/migrate.mjs
 *
 * Get access token: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROJECT_REF = 'ezxjbnfggcxpksclyyax'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌  Missing SUPABASE_ACCESS_TOKEN')
  console.error('   Get one at: https://supabase.com/dashboard/account/tokens')
  console.error('   Then run:  SUPABASE_ACCESS_TOKEN=xxx node scripts/migrate.mjs')
  process.exit(1)
}

// Run all .sql files in migrations/ in alphabetical order
const migDir = resolve(__dirname, '../supabase/migrations')
const files = readdirSync(migDir).filter(f => f.endsWith('.sql')).sort()
const sql = files.map(f => readFileSync(resolve(migDir, f), 'utf8')).join('\n\n')

console.log('🚀 Running migrations:', files.join(', '))

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})

if (!res.ok) {
  const body = await res.text()
  console.error('❌  Migration failed:', res.status, body)
  process.exit(1)
}

console.log('✅  Migration completed successfully!')
