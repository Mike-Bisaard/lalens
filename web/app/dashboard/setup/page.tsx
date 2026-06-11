'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button, Input, Select } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

const BANKS = ['กสิกรไทย (KBANK)','กรุงเทพ (BBL)','ไทยพาณิชย์ (SCB)','กรุงไทย (KTB)','กรุงศรี (BAY)','ทหารไทยธนชาต (TTB)','ออมสิน','ธ.ก.ส.','พร้อมเพย์']

export default function ShopSetupPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^[a-z0-9-]+$/.test(shopSlug)) {
      setError('Shop URL ใช้ได้เฉพาะ a-z, 0-9 และ -')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: shopError } = await supabase.from('shops').insert({
      owner_id: user.id,
      name: shopName,
      slug: shopSlug,
      bank_name: bankName,
      bank_account_encrypted: bankAccount,
    })

    setLoading(false)
    if (shopError) {
      setError(shopError.code === '23505' ? 'Shop URL นี้ถูกใช้แล้ว' : shopError.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <AuthLayout subtitle="ทำครั้งเดียว — ใช้เวลาแค่ 1 นาที">
      <div className="bg-surface-raised border border-border rounded-2xl p-8">
        <h1 className="text-xl font-bold text-white mb-6">ตั้งค่าร้านของคุณ</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="ชื่อร้าน"
            value={shopName}
            onChange={e => {
              setShopName(e.target.value)
              if (!shopSlug) setShopSlug(
                e.target.value.toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/^-+|-+$/g, '')
              )
            }}
            placeholder="เช่น Pikachu Store"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Shop URL</label>
            <div className="flex items-center bg-surface-raised border border-border-input rounded-xl overflow-hidden focus-within:border-violet-500 transition">
              <span className="px-4 text-zinc-500 text-sm border-r border-border py-3 flex-shrink-0">lalens.com/</span>
              <input
                value={shopSlug}
                onChange={e => setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                className="flex-1 bg-transparent px-3 py-3 text-white placeholder-zinc-500 focus:outline-none text-sm"
                placeholder="pikachu-store"
              />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-sm font-semibold text-zinc-300 mb-4">
              บัญชีรับเงิน <span className="text-violet-400">(บังคับ)</span>
            </p>
            <div className="space-y-3">
              <Select label="ธนาคาร" value={bankName} onChange={e => setBankName(e.target.value)} required>
                <option value="">เลือกธนาคาร</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </Select>
              <Input
                label="เลขบัญชี / เบอร์พร้อมเพย์"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value.replace(/\D/g, ''))}
                placeholder="เลขบัญชี / เบอร์พร้อมเพย์"
                required
              />
            </div>
            <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
              ใช้ตรวจสลิปอัตโนมัติ — เงินโอนตรงเข้าบัญชีนี้ ไม่ผ่าน Lalens
            </p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {loading ? 'กำลังสร้างร้าน...' : '🚀 เปิดร้านเลย'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
