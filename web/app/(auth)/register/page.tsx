'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input, Select, Divider } from '@/components/ui'
import { AuthLayout } from '@/components/layout/AuthLayout'

const BANKS = ['กสิกรไทย (KBANK)','กรุงเทพ (BBL)','ไทยพาณิชย์ (SCB)','กรุงไทย (KTB)','กรุงศรี (BAY)','ทหารไทยธนชาต (TTB)','ออมสิน','ธ.ก.ส.','พร้อมเพย์']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'account' | 'shop'>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard/setup` },
    })
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (password.length < 8) { setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return }
    setStep('shop')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!shopName || !shopSlug || !bankName || !bankAccount) {
      setError('กรุณากรอกข้อมูลให้ครบ'); return
    }
    if (!/^[a-z0-9-]+$/.test(shopSlug)) {
      setError('Shop URL ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น'); return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    const userId = data.user?.id
    if (!userId) { setError('สมัครสมาชิกไม่สำเร็จ'); setLoading(false); return }

    // Sign in immediately so the session is active before inserting shop
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(signInError.message); setLoading(false); return }

    const { error: shopError } = await supabase.from('shops').insert({
      owner_id: userId,
      name: shopName,
      slug: shopSlug,
      bank_name: bankName,
      bank_account_encrypted: bankAccount, // TODO: encrypt before storing
    })

    setLoading(false)
    if (shopError) {
      setError(shopError.code === '23505' ? 'Shop URL นี้ถูกใช้ไปแล้ว กรุณาเลือก URL อื่น' : shopError.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <AuthLayout
      subtitle="เปิดร้านขายการ์ดฟรี — ใช้เวลาแค่ 2 นาที"
      footer={
        <p className="text-center text-zinc-500 text-sm">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold">เข้าสู่ระบบ</Link>
        </p>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {['สร้างบัญชี', 'ตั้งค่าร้าน'].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
              i === 0 && step === 'account' ? 'bg-gradient-to-br from-brand-start to-brand-end text-white' :
              i === 0 && step === 'shop'    ? 'bg-emerald-500 text-white' :
              i === 1 && step === 'shop'    ? 'bg-gradient-to-br from-brand-start to-brand-end text-white' :
              'bg-zinc-800 text-zinc-500'
            }`}>
              {i === 0 && step === 'shop' ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium ${
              (i === 0 && step === 'account') || (i === 1 && step === 'shop') ? 'text-white' : 'text-zinc-500'
            }`}>{label}</span>
            {i === 0 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="bg-surface-raised border border-border rounded-2xl p-8">
        {step === 'account' && (
          <>
            <Button variant="secondary" className="w-full mb-0" onClick={handleGoogle}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              สมัครด้วย Google
            </Button>

            <Divider />

            <form onSubmit={handleStep1} className="space-y-4">
              <Input label="อีเมล" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              <Input label="รหัสผ่าน" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="อย่างน้อย 8 ตัวอักษร" required />
              <Input label="ยืนยันรหัสผ่าน" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" className="w-full">ถัดไป →</Button>
            </form>
          </>
        )}

        {step === 'shop' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="ชื่อร้าน"
              value={shopName}
              onChange={e => {
                setShopName(e.target.value)
                if (!shopSlug) setShopSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
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
              <p className="text-xs text-zinc-600">ใช้ได้เฉพาะ a-z, 0-9 และ -</p>
            </div>

            <div className="border-t border-border pt-5">
              <p className="text-sm font-semibold text-zinc-300 mb-4">บัญชีรับเงิน <span className="text-violet-400">(บังคับ)</span></p>
              <div className="space-y-3">
                <Select label="ธนาคาร" value={bankName} onChange={e => setBankName(e.target.value)} required>
                  <option value="">เลือกธนาคาร</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
                <Input
                  label="เลขบัญชี / เบอร์พร้อมเพย์"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000000000"
                  required
                />
              </div>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                ใช้สำหรับตรวจสอบสลิปอัตโนมัติ — เงินผู้ซื้อโอนตรงเข้าบัญชีนี้ ไม่ผ่าน Lalens
              </p>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button variant="secondary" type="button" onClick={() => { setStep('account'); setError('') }}>
                ← ย้อนกลับ
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                {loading ? 'กำลังสร้างร้าน...' : '🚀 เปิดร้านเลย'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="text-center text-zinc-700 text-xs mt-4 leading-relaxed px-4">
        การสมัครสมาชิกถือว่ายอมรับ Terms of Service และ Privacy Policy ของ Lalens
      </p>
    </AuthLayout>
  )
}
