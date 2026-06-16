import Link from 'next/link'
import { FAQAccordion, TapToBuyDemo, BatchScanDemo, CardFace, UserMenu } from '@/components/ui'

/* ── shared style helpers ─────────────────────────────────── */
const KAN = { fontFamily: 'var(--font-kanit), sans-serif' } as const
const ANU = { fontFamily: 'var(--font-anuphan), sans-serif' } as const


const FAQ_ITEMS = [
  { q: 'ต้องเสียค่าธรรมเนียมไหม', a: 'ช่วงเปิดตัวใช้ฟรีทุกฟีเจอร์ เราจะแจ้งล่วงหน้าก่อนเสมอถ้ามีการเปลี่ยนแปลงในอนาคต' },
  { q: 'เงินค่าขายเข้าที่ไหน', a: 'ผู้ซื้อโอนตรงเข้าบัญชีธนาคารของคุณเลย ระบบเราไม่ถือเงินและไม่หักค่าคอมมิชชั่นใดๆ' },
  { q: 'ผู้ซื้อต้องสมัครสมาชิกไหม', a: 'ไม่ต้อง ผู้ซื้อเปิดดูและเลือกซื้อได้เลยโดยไม่ต้องสมัคร กรอกแค่ email ตอน checkout เพื่อรับใบเสร็จ' },
  { q: 'ถ้า 2 คนกดซื้อใบเดียวกันพร้อมกันล่ะ', a: 'ระบบล็อกการ์ดทันทีที่มีคนเริ่ม checkout (ก่อนโอนเงินด้วยซ้ำ) คนที่สองจะเห็นสถานะ "ถูกจองแล้ว" ไม่มีขายซ้ำแน่นอน' },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--ld-paper)', color: 'var(--ld-ink)', ...ANU, overflowX: 'hidden' }}>

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '14px 0' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24,
            background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(12px)',
            border: '1.5px solid var(--ld-line)', borderRadius: 999,
            padding: '10px 12px 10px 22px',
            boxShadow: '0 6px 24px -14px rgba(28,27,36,.35)',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <LogoIcon size={30} />
              <span style={{ ...KAN, fontWeight: 700, fontSize: 20, letterSpacing: '-.02em', color: 'var(--ld-ink)', whiteSpace: 'nowrap' }}>
                ละเล่น
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex" style={{ marginLeft: 'auto', gap: 4 }}>
              {([['ผู้ขาย', '#seller'], ['เทียบกัน', '#compare'], ['เกี่ยวกับเรา', '#trust']] as [string, string][]).map(([label, href]) => (
                <a key={label} href={href}
                  style={{ ...KAN, fontWeight: 500, fontSize: 15, color: 'var(--ld-muted)', padding: '8px 14px', borderRadius: 999, transition: '.15s', textDecoration: 'none' }}
                  className="hover:bg-[#fff6ec] hover:!text-[#1c1b24]">
                  {label}
                </a>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }} className="md:ml-0">
              <UserMenu variant="landing" />
            </div>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section style={{ background: 'var(--ld-warm)', padding: '60px 0 80px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            {/* Text */}
            <div>
              <Chip color="red">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
                ใหม่ · เครื่องมือช่วยขายการ์ด
              </Chip>

              <h1 style={{ ...KAN, fontWeight: 700, fontSize: 'clamp(40px, 5.8vw, 68px)', lineHeight: 1.1, marginTop: 20 }}>
                ขายการ์ด<br />
                <span style={{ position: 'relative', zIndex: 0, display: 'inline-block' }}>
                  ง่ายกว่า
                  <span aria-hidden="true" style={{
                    position: 'absolute', left: '-3%', right: '-3%', bottom: '.1em', height: '.4em',
                    background: 'var(--ld-yellow)', zIndex: -1, borderRadius: 4,
                    transform: 'rotate(-1.5deg)', display: 'block',
                  }} />
                </span>
              </h1>

              <p style={{ ...KAN, fontWeight: 600, fontSize: 'clamp(22px, 2.8vw, 30px)', color: 'var(--ld-red)', marginTop: 14, lineHeight: 1.3 }}>
                ถ่ายรูปเดียว<br />ลงขายได้ทั้งกอง
              </p>

              <p style={{ fontSize: 17, color: 'var(--ld-muted)', marginTop: 18, lineHeight: 1.65, maxWidth: '30em' }}>
                สลิปผ่านระบบตรวจ QR อัตโนมัติ ผู้ซื้อแตะการ์ดในรูปแล้วจ่ายจบในเว็บ ไม่ต้อง DM ไม่ต้องตามสลิป
              </p>

              <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/register" style={{
                  ...KAN, fontWeight: 600, fontSize: 19, color: '#fff',
                  background: 'var(--ld-red)', padding: '16px 34px', borderRadius: 999,
                  boxShadow: '0 5px 0 var(--ld-red-deep)', textDecoration: 'none',
                }} className="transition hover:-translate-y-0.5 active:translate-y-0.5">
                  เริ่มลงขายฟรี
                </Link>
                <Link href="/register" style={{
                  ...KAN, fontWeight: 600, fontSize: 19, color: 'var(--ld-ink)',
                  background: '#fff', padding: '16px 34px', borderRadius: 999,
                  boxShadow: 'inset 0 0 0 2.5px var(--ld-ink)', textDecoration: 'none',
                }} className="transition hover:bg-[#1c1b24] hover:!text-white">
                  ดูตัวอย่างร้าน
                </Link>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginTop: 26 }}>
                {['ครบทุกความต้องการ', 'แตะการ์ดในรูปจ่ายได้เลย', 'โอนตรง ไม่ผ่านระบบ'].map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 15, color: 'var(--ld-muted)', fontWeight: 500 }}>
                    <span style={{ color: 'var(--ld-red)', fontWeight: 700 }}>✓</span> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual — BatchScan grid + float cards + stat chips */}
            <div style={{ position: 'relative' }}>
              {/* Float card fc-1: ริซาร์ top-right */}
              <div style={{ position: 'absolute', top: -34, right: -14, width: 124, zIndex: 3, transform: 'rotate(8deg)' }}>
                <CardFace tone="fire" emblem="Star" hp={130} holo stars={3} rarity="EX" name="ริซาร์" price={990} />
              </div>
              {/* Float card fc-2: มิว bottom-left */}
              <div style={{ position: 'absolute', bottom: -30, left: -26, width: 124, zIndex: 3, transform: 'rotate(-9deg)' }}>
                <CardFace tone="psychic" emblem="Spark" hp={110} holo stars={3} rarity="UR" name="มิว" />
              </div>

              {/* Stat chip sc-a */}
              <div style={{ position: 'absolute', top: '26%', left: -40, zIndex: 4, background: '#fff', borderRadius: 16, padding: '12px 16px', boxShadow: '0 14px 34px -12px rgba(28,27,36,.5)', display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--ld-red)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M2 6h14a2 2 0 0 1 2 2v14" />
                  </svg>
                </span>
                <div>
                  <b style={{ ...KAN, fontSize: 20, fontWeight: 700, display: 'block', lineHeight: 1, color: 'var(--ld-ink)' }}>6 ใบ</b>
                  <small style={{ fontSize: 12.5, color: 'var(--ld-muted)', fontWeight: 500 }}>ตัดกรอบใน 1 รูป</small>
                </div>
              </div>

              {/* Stat chip sc-b */}
              <div style={{ position: 'absolute', top: '50%', right: -8, zIndex: 4, background: '#fff', borderRadius: 16, padding: '12px 16px', boxShadow: '0 14px 34px -12px rgba(28,27,36,.5)', display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--ld-blue)', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3.5h14v17l-2.3-1.4L14.4 21 12 19.6 9.6 21l-2.3-1.9L5 20.5v-17Z" />
                    <path d="M8.5 8h7M8.5 12h7M8.5 15.5h4" />
                  </svg>
                </span>
                <div>
                  <b style={{ ...KAN, fontSize: 16, fontWeight: 700, display: 'block', lineHeight: 1.2, color: 'var(--ld-ink)' }}>ตรวจสลิปอัตโนมัติ</b>
                  <small style={{ fontSize: 12.5, color: 'var(--ld-muted)', fontWeight: 500 }}>ตัดสต็อกทันที</small>
                </div>
              </div>

              {/* Main batch scan grid */}
              <BatchScanDemo variant="grid" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SELLER SECTION ─────────────────────────────────── */}
      <section id="seller" style={{ background: 'var(--ld-warm)', padding: '80px 0' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Chip color="red">🏷 สำหรับผู้ขาย</Chip>
              <h2 style={{ ...KAN, fontWeight: 700, fontSize: 'clamp(28px, 3.8vw, 44px)', lineHeight: 1.12, marginTop: 20 }}>
                ถ่ายรูปเดียว<br />ลงขายได้ทั้งกอง
              </h2>
              <p style={{ fontSize: 18, color: 'var(--ld-muted)', marginTop: 16, lineHeight: 1.65 }}>
                เลิกพิมพ์โพสต์ทีละใบจนนิ้วล้า จุดที่ระบบขายทั่วไปยังทำไม่ได้ — ลงของเป็นกองในไม่กี่นาที
              </p>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { n: 1, color: 'var(--ld-red)', title: 'ถ่ายรูปหมู่ทีเดียว', desc: 'วางการ์ดเรียงกันแล้วถ่ายรูปเดียว ไม่ต้องแยกถ่ายทีละใบ' },
                  { n: 2, color: 'var(--ld-yellow)', textC: 'var(--ld-ink)', title: 'ระบบตัดกรอบให้อัตโนมัติ', desc: 'AI ตัดกรอบแยกเป็นรายใบ พร้อมให้คุณตรวจ/ลากแก้กรอบได้' },
                  { n: 3, color: 'var(--ld-blue)', title: 'ตั้งราคา/สภาพ (มี default ให้)', desc: 'ระบบเติมค่าเริ่มต้นให้ แก้เฉพาะที่อยากแก้ เร็วกว่าพิมพ์เอง' },
                  { n: 4, color: 'var(--ld-ink)', title: 'กดขึ้นขาย — ได้ลิงก์ร้านทันที', desc: 'เห็นของทั้งร้านใน 1 ลิงก์ พร้อม preview สวยตอนแชร์' },
                ].map(s => (
                  <div key={s.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 12, background: s.color, color: s.textC ?? '#fff', display: 'grid', placeItems: 'center', ...KAN, fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                      {s.n}
                    </span>
                    <div>
                      <h4 style={{ ...KAN, fontSize: 18, fontWeight: 600 }}>{s.title}</h4>
                      <p style={{ color: 'var(--ld-muted)', fontSize: 15.5, marginTop: 3 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 32 }}>
                <Link href="/register" style={{ ...KAN, fontWeight: 600, fontSize: 17, color: '#fff', background: 'var(--ld-red)', padding: '14px 28px', borderRadius: 999, boxShadow: '0 5px 0 var(--ld-red-deep)', textDecoration: 'none' }}>
                  เริ่มลงขายฟรี →
                </Link>
              </div>
            </div>

            {/* Batch scan pile demo */}
            <div style={{ position: 'relative' }}>
              <BatchScanDemo variant="pile" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── BUYER SECTION ──────────────────────────────────── */}
      <section style={{ background: 'var(--ld-paper)', padding: '80px 0' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Interactive shop mockup */}
            <div>
              <TapToBuyDemo />
            </div>

            {/* Text */}
            <div>
              <Chip color="blue">🛒 สำหรับคนซื้อ</Chip>
              <h2 style={{ ...KAN, fontWeight: 700, fontSize: 'clamp(28px, 3.8vw, 44px)', lineHeight: 1.12, marginTop: 20 }}>
                แตะการ์ดในรูป<br />
                <span style={{ color: 'var(--ld-red)' }}>หยิบใส่ตะกร้าได้เลย</span>
              </h2>
              <p style={{ fontSize: 18, color: 'var(--ld-muted)', marginTop: 16, lineHeight: 1.65 }}>
                ไม่ต้องคอมเมนต์จองให้สับสน ไม่ต้องทักแชทรอตอบ — เลือกของแล้วจ่ายจบในเว็บเลย
              </p>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: '👆', title: 'แตะการ์ดที่อยากได้', desc: 'เปิดลิงก์ร้านตรงรูปเพื่อเพิ่มทุกใบลงตะกร้า แล้วหยิบใส่ตะกร้า' },
                  { icon: '📱', title: 'แนบสลิปในเว็บ', desc: 'โอนเข้าบัญชีร้านโดยตรง แล้วแนบสลิป ระบบตรวจ QR เทียบบัญชี+ยอดอัตโนมัติ' },
                  { icon: '✅', title: 'ผ่านแล้วตัดสต็อก', desc: 'ของทุกใบมี ID เดียว ล็อกตั้งแต่เริ่มจ่าย ไม่มีเคสจ่ายแล้วของหาย' },
                ].map(f => (
                  <div key={f.icon} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--ld-tint-red)', display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>
                      {f.icon}
                    </span>
                    <div>
                      <h4 style={{ ...KAN, fontSize: 17, fontWeight: 600 }}>{f.title}</h4>
                      <p style={{ color: 'var(--ld-muted)', fontSize: 15, marginTop: 3 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 22, fontSize: 14, color: 'var(--ld-muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ color: 'var(--ld-red)' }}>⏱</span>
                จองปุ๊บล็อกราคาให้ 10 นาที กันโดนแย่งและกันราคาเปลี่ยนระหว่างจ่าย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─────────────────────────────────── */}
      <section style={{ background: 'var(--ld-paper)', padding: '80px 0' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
            <Chip color="yellow">⚡ ครบทุกอย่างที่ร้านต้องใช้</Chip>
            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 'clamp(30px, 4.2vw, 46px)', lineHeight: 1.12, marginTop: 20 }}>
              ทำงานหนักหลังบ้าน<br />ให้คุณขายสบายๆ
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { ico: '📋', bg: 'var(--ld-red)',    tc: '#fff', title: 'ตรวจสลิปอัตโนมัติ',     desc: 'อ่าน QR สลิป เทียบบัญชีร้าน+ยอดให้ทันที สลิปปลอม/ซ้ำ/ผิดบัญชี ไม่ผ่าน' },
              { ico: '🔒', bg: 'var(--ld-blue)',   tc: '#fff', title: 'ล็อกสต็อกกันขายซ้ำ',    desc: 'การ์ดทุกใบมี ID เดียว ล็อกตั้งแต่เริ่ม checkout ไม่มีเคสจ่ายแล้วของหาย' },
              { ico: '🔔', bg: 'var(--ld-yellow)', tc: 'var(--ld-ink)', title: 'แจ้งเตือนทันใจ', desc: 'ออเดอร์ใหม่/อัปเดตสถานะ เด้งทั้งในเว็บและอีเมล ไม่พลาดดีล' },
              { ico: '🔗', bg: 'var(--ld-red)',    tc: '#fff', title: 'หน้าร้าน 1 ลิงก์',      desc: 'แชร์ลิงก์เดียวเห็นของทั้งร้าน พร้อม preview สวยเวลาแชร์ลงโซเชียล' },
              { ico: '✏️', bg: 'var(--ld-blue)',   tc: '#fff', title: 'จัดการของง่าย',          desc: 'แก้ราคา/จำนวน เติมของใหม่ กด "ขายแล้ว" เกรย์ใบทันทีถ้าขายที่อื่น' },
              { ico: '💵', bg: 'var(--ld-yellow)', tc: 'var(--ld-ink)', title: 'เงินเข้าบัญชีคุณตรง', desc: 'ผูกบัญชีตั้งแต่สมัคร ผู้ซื้อโอนตรง เราไม่ถือเงินใครสักบาท' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', border: '1.5px solid var(--ld-line)', borderRadius: 22, padding: 28, transition: 'transform .18s, box-shadow .18s' }}
                className="hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(28,27,36,.25)]">
                <div style={{ width: 52, height: 52, borderRadius: 15, background: f.bg, color: f.tc, display: 'grid', placeItems: 'center', marginBottom: 18, fontSize: 22 }}>
                  {f.ico}
                </div>
                <h4 style={{ ...KAN, fontSize: 19, fontWeight: 600 }}>{f.title}</h4>
                <p style={{ color: 'var(--ld-muted)', marginTop: 8, fontSize: 15, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ───────────────────────────────── */}
      <section id="compare" style={{ background: 'var(--ld-warm)', padding: '80px 0' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <Chip color="red">✦ เทียบกันชัดๆ</Chip>
            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: 1.12, marginTop: 18 }}>
              เทียบกับการขายแบบเดิมๆ
            </h2>
          </div>
          <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', border: '2px solid var(--ld-ink)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 18px 0 -6px var(--ld-yellow)' }}>
            {/* Header row — 3 cols always */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', background: 'var(--ld-ink)', color: '#fff' }}>
              <div style={{ padding: '18px 22px' }} />
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.65)', ...KAN, fontWeight: 600, fontSize: 'clamp(12px,1.4vw,15px)' }}>ขายแบบเดิม</div>
              <div style={{ padding: '18px 22px', background: 'var(--ld-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...KAN, fontWeight: 600, fontSize: 'clamp(12px,1.4vw,15px)' }}>
                <LogoIcon size={20} /> ละเล่น
              </div>
            </div>
            {[
              { label: 'ลงขายหลายใบ',     fb: 'พิมพ์ทีละใบ จนนิ้วล้า',       us: 'ถ่ายรูปเดียว ระบบตัดกรอบให้' },
              { label: 'ผู้ซื้อหยิบของ',  fb: 'คอมเมนต์จอง สับสนว่าใครได้',  us: 'แตะการ์ดในรูป เข้าตะกร้าเลย' },
              { label: 'ตรวจการจ่ายเงิน', fb: 'เปิดสลิปไล่เช็คเอง',            us: 'ตรวจ QR อัตโนมัติใน 2 วิ'    },
              { label: 'กันขายซ้ำ 2 คน',  fb: 'พลาดบ่อย ต้องคืนเงิน',         us: 'ล็อกสต็อกอัตโนมัติ'          },
              { label: 'จัดการออเดอร์',   fb: 'ต้องจัดการเอง',                 us: 'ระบบสรุปให้ครบ'              },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', borderTop: '1.5px solid var(--ld-line)', alignItems: 'center' }}>
                {/* Label */}
                <div style={{ padding: 'clamp(12px,1.8vw,17px) clamp(12px,1.8vw,22px)', ...KAN, fontWeight: 600, fontSize: 'clamp(12px,1.4vw,15.5px)' }}>{row.label}</div>
                {/* FB */}
                <div style={{ padding: 'clamp(12px,1.8vw,17px) clamp(8px,1.4vw,22px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 'clamp(11px,1.3vw,15px)', color: 'var(--ld-muted)', textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </span>
                  {row.fb}
                </div>
                {/* ละเล่น */}
                <div style={{ padding: 'clamp(12px,1.8vw,17px) clamp(8px,1.4vw,22px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 'clamp(11px,1.3vw,15px)', fontWeight: 500, background: 'var(--ld-tint-red)', color: 'var(--ld-ink)', textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', flexShrink: 0, color: 'var(--ld-red)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4.5 12.5 5 5 10-11" />
                    </svg>
                  </span>
                  {row.us}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST SECTION ──────────────────────────────────── */}
      <section id="trust" style={{ background: 'var(--ld-warm)', padding: '0 0 80px' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div className="px-5 py-10 md:px-12 md:py-14" style={{ background: 'var(--ld-ink)', borderRadius: 32, position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
            <div aria-hidden style={{ position: 'absolute', bottom: -80, right: 80, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.03)' }} />

            <Chip color="ink">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.5l2.39 4.84 5.35.78-3.87 3.77.91 5.32L10 13.77l-4.78 2.44.91-5.32L2.26 7.12l5.35-.78L10 1.5z" clipRule="evenodd" /></svg>
              โปร่งใส ตรงไปตรงมา
            </Chip>

            <h2 style={{ ...KAN, color: '#fff', fontSize: 'clamp(26px, 3.6vw, 40px)', fontWeight: 700, marginTop: 22, lineHeight: 1.15, maxWidth: 560 }}>
              เราเป็น &ldquo;เครื่องมือช่วยขาย&rdquo; ไม่ใช่<br />คนกลางถือเงิน
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-9">
              {[
                { ico: '💵', title: 'เงินไม่ผ่านระบบเรา',            desc: 'ผู้ซื้อโอนเข้าบัญชีผู้ขายโดยตรง เราไม่ถือเงินใคร ไม่มี escrow' },
                { ico: '📋', title: 'เราช่วยตรวจสลิป + ตัดสต็อก', desc: 'ทำหน้าที่ยืนยันการจ่ายและจัดของให้ ไม่ใช่ตัวกลางรับประกันดีล' },
                { ico: '🔐', title: 'ข้อมูลบัญชีเข้ารหัส',          desc: 'เก็บข้อมูลแบบเข้ารหัส ทำตาม PDPA ขอความยินยอมตั้งแต่เริ่มใช้' },
              ].map(f => (
                <div key={f.title} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 18, padding: 24 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--ld-yellow)', display: 'grid', placeItems: 'center', fontSize: 20, marginBottom: 16 }}>{f.ico}</div>
                  <h4 style={{ color: '#fff', ...KAN, fontSize: 18, fontWeight: 600 }}>{f.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14.5, marginTop: 7, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 28, background: 'rgba(255,255,255,.05)', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 14, color: 'rgba(255,255,255,.82)', lineHeight: 1.65 }}>
              <svg style={{ flexShrink: 0, marginTop: 2, color: 'var(--ld-yellow)' }} width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zm.75 4.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm-.75 8.5a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
              </svg>
              <span><strong style={{ ...KAN }}>ข้อควรรู้:</strong> ละเล่นช่วยตรวจสลิปและตัดสต็อกให้เท่านั้น เงินโอนตรงระหว่างผู้ซื้อกับผู้ขาย เราไม่รับประกันการซื้อขายและไม่รับผิดชอบกรณีข้อพิพาทระหว่างคู่ค้า โปรดตรวจสอบคู่ค้าทุกครั้งก่อนโอน</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section style={{ background: 'var(--ld-warm)', padding: '80px 0' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
            <Chip color="blue">🔔 คำถามที่พบบ่อย</Chip>
            <h2 style={{ ...KAN, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 46px)', lineHeight: 1.12, marginTop: 18 }}>
              สงสัยอะไร ถามได้เลย
            </h2>
          </div>
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ─── CTA BAND ───────────────────────────────────────── */}
      <section style={{ background: 'var(--ld-warm)', padding: '0 0 80px' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: 'linear-gradient(150deg, var(--ld-red), #ff5a3c)', borderRadius: 32, padding: '72px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', color: '#fff' }}>
            <div aria-hidden style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
            <div aria-hidden style={{ position: 'absolute', bottom: -80, right: -30, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <Chip color="yellow">✦ เริ่มได้เลยวันนี้</Chip>
              <h2 style={{ ...KAN, color: '#fff', fontSize: 'clamp(28px, 4.4vw, 50px)', fontWeight: 700, lineHeight: 1.12, marginTop: 20 }}>
                พร้อมขายการ์ดแบบสบายๆ<br />แล้วหรือยัง?
              </h2>
              <p style={{ color: 'rgba(255,255,255,.9)', fontSize: 19, marginTop: 16 }}>
                สมัครฟรี ผูกบัญชีรับเงิน แล้วลงขายของกองแรกได้ในไม่กี่นาที
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/register" style={{ ...KAN, fontWeight: 600, fontSize: 19, color: 'var(--ld-ink)', background: 'var(--ld-yellow)', padding: '17px 34px', borderRadius: 999, boxShadow: '0 5px 0 var(--ld-yellow-deep)', textDecoration: 'none' }}
                  className="transition hover:-translate-y-0.5">
                  เริ่มลงขายฟรี →
                </Link>
                <Link href="/register" style={{ ...KAN, fontWeight: 600, fontSize: 19, color: '#fff', background: 'transparent', padding: '17px 34px', borderRadius: 999, boxShadow: 'inset 0 0 0 2.5px rgba(255,255,255,.6)', textDecoration: 'none' }}
                  className="transition hover:bg-white/10">
                  ดูตัวอย่างร้าน
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ background: 'var(--ld-paper)', borderTop: '1.5px solid var(--ld-line)', padding: '64px 0 40px' }}>
        <div style={{ maxWidth: 'var(--ld-maxw)', margin: '0 auto', padding: '0 24px' }}>
          <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 mb-11">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                <LogoIcon size={32} />
                <span style={{ ...KAN, fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ld-ink)' }}>ละเล่น</span>
              </Link>
              <p style={{ fontSize: 15, color: 'var(--ld-muted)', marginTop: 14, maxWidth: '26em', lineHeight: 1.65 }}>
                เครื่องมือช่วยขายการ์ดสะสมที่ทำให้การลงขายของและจ่ายเงินในเว็บเดียว เริ่มที่การ์ด Pokemon
              </p>
            </div>
            {[
              { h: 'ผลิตภัณฑ์', links: ['เริ่มสมัคร', 'ดูตัวอย่างร้าน', 'Dashboard'] },
              { h: 'ช่วยเหลือ', links: ['คำถามบ่อย', 'ติดต่อเรา', 'วิธีแนบสลิป'] },
              { h: 'กฎหมาย', links: ['นโยบายความเป็นส่วนตัว', 'ข้อกำหนดการใช้งาน'] },
            ].map(col => (
              <div key={col.h}>
                <h5 style={{ ...KAN, fontWeight: 600, fontSize: 15, marginBottom: 14 }}>{col.h}</h5>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" style={{ color: 'var(--ld-muted)', fontSize: 15, padding: '5px 0', display: 'block', textDecoration: 'none' }}
                        className="hover:!text-[var(--ld-red)]">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1.5px solid var(--ld-line)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, color: 'var(--ld-muted)', fontSize: 14 }}>
            <span>© 2026 ละเล่น. สร้างด้วยใจสำหรับนักสะสมการ์ด</span>
            <span className="text-right" style={{ maxWidth: '50em' }}>⚠️ ละเล่นเป็นเพียงเครื่องมือช่วยซื้อขาย ไม่รับผิดชอบกรณีโกงหรือข้อพิพาทระหว่างผู้ซื้อและผู้ขาย</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────── */

function LogoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lgA" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd633" />
          <stop offset=".5" stopColor="#ffae00" />
          <stop offset="1" stopColor="#ee1c25" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lgA)" />
      <rect x="2" y="2" width="44" height="44" rx="13" fill="none" stroke="#1c1b24" strokeWidth="2.5" opacity=".85" />
      <g transform="rotate(-15 24 27)">
        <rect x="11.5" y="15" width="15.5" height="21" rx="3.4" fill="#fff" stroke="#1c1b24" strokeWidth="2.2" />
      </g>
      <rect x="21" y="14" width="15.5" height="21" rx="3.4" fill="#fff" stroke="#1c1b24" strokeWidth="2.2" />
      <path d="M28.8 19.6l1.7 3.5 3.9.5-2.8 2.7.7 3.9-3.5-1.9-3.5 1.9.7-3.9-2.8-2.7 3.9-.5z" fill="#ffcb05" stroke="#1c1b24" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function Chip({ color, children }: { color: 'red' | 'yellow' | 'blue' | 'ink'; children: React.ReactNode }) {
  const s = {
    red:    { bg: 'var(--ld-tint-red)',    fg: 'var(--ld-red)' },
    yellow: { bg: 'var(--ld-tint-yellow)', fg: 'var(--ld-yellow-deep)' },
    blue:   { bg: 'var(--ld-tint-blue)',   fg: 'var(--ld-blue)' },
    ink:    { bg: 'rgba(255,255,255,.14)', fg: 'rgba(255,255,255,.9)' },
  }[color]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, ...KAN, fontWeight: 600, fontSize: 14, padding: '7px 15px', borderRadius: 999, background: s.bg, color: s.fg, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}
