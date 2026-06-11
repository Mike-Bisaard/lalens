#!/usr/bin/env node
/**
 * Run only the LATEST migration file (avoids re-running 0001 which causes errors)
 * Usage: SUPABASE_ACCESS_TOKEN=xxx node scripts/migrate-latest.mjs
 *
 * To run a specific file:
 *   SUPABASE_ACCESS_TOKEN=xxx MIGRATION_FILE=0002_grants_and_fixes.sql node scripts/migrate-latest.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_REF = 'ezxjbnfggcxpksclyyax'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!ACCESS_TOKEN) {
  console.error('❌  Missing SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}

const migDir = resolve(__dirname, '../supabase/migrations')
const files = readdirSync(migDir).filter(f => f.endsWith('.sql')).sort()

const target = process.env.MIGRATION_FILE ?? files[files.length - 1]
const file = files.find(f => f === target) ?? files[files.length - 1]
const sql = readFileSync(resolve(migDir, file), 'utf8')

console.log('🚀 Running migration:', file)

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})

const body = await res.text()
if (!res.ok) {
  console.error('❌  Failed:', res.status, body)
  process.exit(1)
}

console.log('✅  Done!', body.slice(0, 200))
