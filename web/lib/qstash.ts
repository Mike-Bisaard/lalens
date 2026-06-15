import { Client } from '@upstash/qstash'

// Lazily initialized so missing env vars don't crash at import time
let _client: Client | null = null

function getClient() {
  if (!_client) {
    if (!process.env.QSTASH_TOKEN) throw new Error('QSTASH_TOKEN env var is not set')
    _client = new Client({ token: process.env.QSTASH_TOKEN })
  }
  return _client
}

/**
 * Schedule a one-time job to release a specific order at its expiry time.
 * QStash will POST to /api/orders/{orderId}/release at exactly `deliverAt`.
 */
export async function scheduleOrderRelease(orderId: string, deliverAt: Date) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) throw new Error('NEXT_PUBLIC_APP_URL env var is not set')

  const client = getClient()
  await client.publishJSON({
    url: `${baseUrl}/api/orders/${orderId}/release`,
    body: { orderId },
    notBefore: Math.floor(deliverAt.getTime() / 1000), // unix seconds
    retries: 3,
  })
}
