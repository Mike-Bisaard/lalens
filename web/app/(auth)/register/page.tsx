'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { translateAuthError } from '@/lib/translate-error'

const S: Record<string, React.CSSProperties> = {
  back:    { display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: '"Kanit",sans-serif', fontWeight: 500, fontSize: 13.5, color: '#6b6a76', textDecoration: 'none', marginBottom: 18 },
  head:    { fontFamily: '"Kanit",sans-serif', fontWeight: 700, fontSize: 30, color: '#1c1b24', lineHeight: 1.1, margin: 0 },
  sub:     { fontSize: 15.5, color: '#6b6a76', marginTop: 8 },
  google:  { width: '100%', marginTop: 20, border: '1.5px solid #ededf0', background: '#fff', borderRadius: 14, padding: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 11, fontFamily: '"Kanit",sans-serif', fontWeight: 600, fontSize: 15.5, color: '#1c1b24', cursor: 'pointer', transition: '.13s' },
  orWrap:  { display: 'flex', alignItems: 'center', gap: 13, margin: '15px 0', color: '#6b6a76', fontSize: 12.5, fontFamily: '"Kanit",sans-serif', whiteSpace: 'nowrap' as const },
  orLine:  { flex: 1, height: 1.5, background: '#ededf0' },
  label:   { display: 'block', fontFamily: '"Kanit",sans-serif', fontWeight: 500, fontSize: 13.5, marginBottom: 7, color: '#1c1b24' },
  req:     { color: '#ee1c25' },
  input:   { width: '100%', border: '1.5px solid #ededf0', borderRadius: 13, padding: '14px 15px', fontSize: 15.5, color: '#1c1b24', background: '#faf9f7', outline: 'none', transition: '.12s', boxSizing: 'border-box' as const },
  inputPR: { width: '100%', border: '1.5px solid #ededf0', borderRadius: 13, padding: '14px 62px 14px 15px', fontSize: 15.5, color: '#1c1b24', background: '#faf9f7', outline: 'none', transition: '.12s', boxSizing: 'border-box' as const },
  eyeBtn:  { position: 'absolute' as const, right: 8, top: '50%', transform: 'translateY(-50%)', height: 32, padding: '0 10px', border: 'none', background: 'none', color: '#2a75bb', fontFamily: '"Kanit",sans-serif', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', borderRadius: 9 },
  hint:    { fontSize: 12, color: '#6b6a76', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 },
  hintOk:  { fontSize: 12, color: '#2e9e4f', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 },
  hintBad: { fontSize: 12, color: '#ee1c25', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 },
  submit:  { width: '100%', marginTop: 18, border: 'none', background: '#ee1c25', color: '#fff', fontFamily: '"Kanit",sans-serif', fontWeight: 600, fontSize: 18, padding: 16, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 5px 0 #c0141b', transition: 'transform .12s, box-shadow .12s' },
  submitD: { width: '100%', marginTop: 18, border: 'none', background: '#e6e3df', color: '#6b6a76', fontFamily: '"Kanit",sans-serif', fontWeight: 600, fontSize: 18, padding: 16, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'default', boxShadow: 'none' },
  terms:   { fontSize: 11.5, color: '#6b6a76', textAlign: 'center' as const, marginTop: 18, lineHeight: 1.55 },
  termsA:  { color: '#2a75bb', textDecoration: 'underline' },
  switch:  { textAlign: 'center' as const, fontSize: 14, color: '#6b6a76', marginTop: 20, paddingTop: 18, borderTop: '1.5px solid #ededf0' },
  switchB: { color: '#ee1c25', fontFamily: '"Kanit",sans-serif', fontWeight: 600, textDecoration: 'none' },
  // success
  doneWrap:{ textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  doneCirc:{ width: 84, height: 84, borderRadius: '50%', background: '#2e9e4f', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 12px 28px -8px rgba(46,158,79,.5)', marginBottom: 18 },
  doneH2:  { fontFamily: '"Kanit",sans-serif', fontWeight: 700, fontSize: 27, margin: 0, color: '#1c1b24' },
  doneP:   { fontSize: 15, color: '#6b6a76', marginTop: 10, maxWidth: '24em', lineHeight: 1.6 },
  doneCTA: { width: '100%', marginTop: 26, border: 'none', background: '#ee1c25', color: '#fff', fontFamily: '"Kanit",sans-serif', fontWeight: 600, fontSize: 18, padding: 16, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 5px 0 #c0141b', textDecoration: 'none' },
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 4.5 29.3 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5 45.5 35.9 45.5 24c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M5.3 14.7l6.6 4.8C13.6 15.4 18.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 16 4 9.1 8.6 5.3 14.7z" transform="translate(0 -1.5)"/>
      <path fill="#4CAF50" d="M24 45.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9 41 16 45.5 24 45.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2c-.4.4 6.6-4.8 6.6-14.7 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  )
}

function CheckIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>
}
function XIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const pwOk = pw.length >= 8
  const pw2Ok = pw2.length > 0 && pw2 === pw
  const canSubmit = emailOk && pwOk && pw2Ok

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard/setup` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({ email, password: pw })
    setLoading(false)
    if (err) { setError(translateAuthError(err.message)); return }
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout mode="signup">
        <div style={S.doneWrap}>
          <div style={S.doneCirc}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m4.5 12.5 5 5 10-11"/>
            </svg>
          </div>
          <h2 style={S.doneH2}>สมัครสำเร็จ 🎉</h2>
          <p style={S.doneP}>ยินดีต้อนรับสู่ ละเล่น! ขั้นต่อไปคือตั้งชื่อร้านและผูกบัญชีรับเงิน แล้วเริ่มลงขายได้เลย</p>
          <Link href="/dashboard/setup" style={S.doneCTA}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            ไปตั้งค่าร้านต่อ
          </Link>
          <p style={{ ...S.switch, border: 'none', marginTop: 14 }}>สมัครด้วย <b style={{ color: '#1c1b24' }}>{email}</b></p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout mode="signup">
      <Link href="/" style={S.back}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        กลับหน้าแรก
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h2 style={S.head}>สมัครเปิดร้าน</h2>
        <p style={S.sub}>สมัครฟรี ลงขายได้ทั้งกองในไม่กี่นาที</p>
      </div>

      <button style={S.google} onClick={handleGoogle}>
        <GoogleIcon/> สมัครด้วย Google
      </button>

      <div style={S.orWrap}>
        <span style={S.orLine}/> หรือสมัครด้วยอีเมล <span style={S.orLine}/>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div style={{ marginBottom: 13 }}>
          <label style={S.label}>อีเมล <span style={S.req}>*</span></label>
          <input
            style={S.input}
            type="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            onFocus={e => { e.currentTarget.style.borderColor = '#ee1c25'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(238,28,37,.1)' }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = '#ededf0'; e.currentTarget.style.background = '#faf9f7'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {touched && email && !emailOk && (
            <div style={S.hintBad}><XIcon/> รูปแบบอีเมลไม่ถูกต้อง</div>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <label style={S.label}>รหัสผ่าน <span style={S.req}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input
              style={S.inputPR}
              type={show ? 'text' : 'password'}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onBlur={() => setTouched(true)}
              onFocus={e => { e.currentTarget.style.borderColor = '#ee1c25'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(238,28,37,.1)' }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = '#ededf0'; e.currentTarget.style.background = '#faf9f7'; e.currentTarget.style.boxShadow = 'none' }}
            />
            <button type="button" style={S.eyeBtn} onClick={() => setShow(s => !s)}>
              {show ? 'ซ่อน' : 'แสดง'}
            </button>
          </div>
          {pw && !pwOk
            ? <div style={S.hintBad}><XIcon/> ต้องมีอย่างน้อย 8 ตัวอักษร</div>
            : pwOk
              ? <div style={S.hintOk}><CheckIcon/> รหัสผ่านใช้ได้</div>
              : <div style={S.hint}>อย่างน้อย 8 ตัวอักษร</div>}
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: 8 }}>
          <label style={S.label}>ยืนยันรหัสผ่าน <span style={S.req}>*</span></label>
          <input
            style={S.input}
            type={show ? 'text' : 'password'}
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            value={pw2}
            onChange={e => setPw2(e.target.value)}
            onBlur={() => setTouched(true)}
            onFocus={e => { e.currentTarget.style.borderColor = '#ee1c25'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(238,28,37,.1)' }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = '#ededf0'; e.currentTarget.style.background = '#faf9f7'; e.currentTarget.style.boxShadow = 'none' }}
          />
          {pw2 && pw2 !== pw
            ? <div style={S.hintBad}><XIcon/> รหัสผ่านไม่ตรงกัน</div>
            : pw2Ok
              ? <div style={S.hintOk}><CheckIcon/> รหัสผ่านตรงกัน</div>
              : <div style={S.hint}>พิมพ์รหัสผ่านเดิมอีกครั้งเพื่อยืนยัน</div>}
        </div>

        {error && <p style={{ ...S.hintBad, marginBottom: 0 }}>{error}</p>}

        <button type="submit" style={canSubmit ? S.submit : S.submitD} disabled={!canSubmit || loading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          {loading ? 'กำลังสมัคร...' : 'สมัครด้วยอีเมล'}
        </button>

        <p style={S.terms}>
          การสมัครถือว่ายอมรับ <a href="#" style={S.termsA}>ข้อกำหนด</a> และ <a href="#" style={S.termsA}>นโยบายความเป็นส่วนตัว</a> (PDPA)
        </p>
      </form>

      <p style={S.switch}>
        มีบัญชีแล้ว? <Link href="/login" style={S.switchB}>เข้าสู่ระบบ</Link>
      </p>
    </AuthLayout>
  )
}
