import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-text { background: linear-gradient(135deg,#7c6af0 0%,#c26af0 50%,#f06a9e 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .6s ease both; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] py-4 bg-[#09090f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <span className="text-xl font-black gradient-text">Lalens</span>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition">ฟีเจอร์</a>
          <a href="#how" className="hover:text-white transition">วิธีใช้</a>
          <a href="#pricing" className="hover:text-white transition">ราคา</a>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 border border-white/10 hover:text-white hover:border-white/20 transition">เข้าสู่ระบบ</Link>
          <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_20px_rgba(124,106,240,.4)] hover:opacity-90 transition">เปิดร้านฟรี</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(124,106,240,.18),transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-sm font-semibold text-violet-300 mb-8 fade-up">
          <span className="w-2 h-2 rounded-full bg-violet-500" style={{animation:'pulse 2s infinite'}} />
          เปิด Beta แล้ว — เข้าร่วมฟรีตอนนี้
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-3xl mb-6 fade-up" style={{animationDelay:'.1s'}}>
          ขายการ์ดสะสม<br/>
          <span className="gradient-text">ง่ายกว่า Facebook</span><br/>
          10 เท่า
        </h1>

        <p className="text-lg text-zinc-400 max-w-md mb-10 leading-relaxed fade-up" style={{animationDelay:'.2s'}}>
          ถ่ายรูปการ์ดทีเดียวทั้งกอง ระบบตัดแยกทุกใบอัตโนมัติ ผู้ซื้อกดจ่ายได้เลย ไม่ต้องลงขายทีละใบ
        </p>

        <div className="flex gap-4 flex-wrap justify-center fade-up" style={{animationDelay:'.3s'}}>
          <Link href="/register" className="px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_40px_rgba(124,106,240,.4)] hover:shadow-[0_0_60px_rgba(124,106,240,.6)] hover:-translate-y-0.5 transition-all">
            เปิดร้านฟรีเลย
          </Link>
          <a href="#how" className="px-8 py-4 rounded-2xl text-base font-bold text-white border border-white/15 hover:bg-white/5 transition">
            ดูวิธีใช้งาน
          </a>
        </div>

        {/* MOCKUP */}
        <div className="mt-20 w-full max-w-3xl fade-up" style={{animationDelay:'.4s'}}>
          <div className="bg-[#0f0f1a] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,.6),0_0_60px_rgba(124,106,240,.1)]">
            <div className="bg-[#141426] px-5 py-3 flex items-center gap-2 border-b border-white/[0.06]">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]"/>
              <span className="w-3 h-3 rounded-full bg-[#febc2e]"/>
              <span className="w-3 h-3 rounded-full bg-[#28c840]"/>
              <span className="ml-3 bg-white/5 rounded px-3 py-1 text-xs text-zinc-600">lalens.com/shop/pikachu-store</span>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-zinc-500 mb-3">📦 โพสต์ใหม่ — 6 ใบ</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {icon:'⚡',name:'Pikachu VMAX',price:'฿450',sel:true},
                    {icon:'🌊',name:'Gyarados EX',price:'฿280',sel:false},
                    {icon:'🔥',name:'Charizard SR',price:'฿1,200',sel:true},
                    {icon:'🌿',name:'Venusaur EX',price:'฿320',sel:false},
                    {icon:'💎',name:'Mewtwo SAR',price:'฿2,800',sel:true},
                    {icon:'❄️',name:'Articuno',price:'฿180',sel:false},
                  ].map((c,i) => (
                    <div key={i} className={`relative rounded-xl border-2 overflow-hidden transition-all ${c.sel ? 'border-violet-500 shadow-[0_0_14px_rgba(124,106,240,.4)]' : 'border-transparent bg-white/[.03]'}`}>
                      <div className="aspect-[2/3] flex flex-col items-center justify-center gap-1 p-2">
                        <span className="text-2xl">{c.icon}</span>
                        <span className="text-[8px] text-zinc-500 text-center font-semibold leading-tight">{c.name}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{c.price}</span>
                      </div>
                      {c.sel && <div className="absolute top-1 right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-[8px] font-bold">✓</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-zinc-500">🛒 ตะกร้า (3 ใบ)</p>
                {[{icon:'⚡',n:'Pikachu VMAX',p:'฿450'},{icon:'🔥',n:'Charizard SR',p:'฿1,200'},{icon:'💎',n:'Mewtwo SAR',p:'฿2,800'}].map((item,i)=>(
                  <div key={i} className="flex items-center gap-2 bg-white/[.03] border border-white/[.06] rounded-xl p-2">
                    <div className="w-8 h-11 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
                    <span className="flex-1 text-xs font-semibold">{item.n}</span>
                    <span className="text-xs font-bold text-emerald-400">{item.p}</span>
                  </div>
                ))}
                <div className="border-t border-white/[.06] pt-2 flex justify-between text-sm font-bold">
                  <span>รวม</span><span className="text-emerald-400">฿4,450</span>
                </div>
                <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold">💳 ชำระเงิน</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="px-[5%] pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-white/[.08] rounded-2xl overflow-hidden bg-[#0f0f1a]">
          {[
            {n:'10×',l:'เร็วกว่าลงขายบน Facebook'},
            {n:'0 บาท',l:'ค่าธรรมเนียมเฟสแรก'},
            {n:'10 วิ',l:'ตรวจสลิปอัตโนมัติ'},
            {n:'100%',l:'เงินเข้าบัญชีคุณโดยตรง'},
          ].map((s,i)=>(
            <div key={i} className="px-6 py-8 text-center border-r border-b border-white/[.06] last:border-r-0 md:[&:nth-child(2)]:border-r md:[&:nth-child(4)]:border-r-0 [&:nth-child(n+3)]:border-b-0">
              <div className="text-3xl font-black gradient-text mb-1">{s.n}</div>
              <div className="text-xs text-zinc-500 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="px-[5%] py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs font-semibold text-violet-300 mb-5">✨ ฟีเจอร์หลัก</div>
        <h2 className="text-4xl font-black tracking-tight mb-4">ทุกอย่างที่ต้องการ<br/><span className="gradient-text">ในที่เดียว</span></h2>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {[
            {icon:'📸',t:'Batch Upload อัจฉริยะ',d:'ถ่ายรูปหมู่ → AI ตัดกรอบแยกทุกใบ → ตั้งชื่อ/ราคา/สภาพ → ขึ้นขายทีเดียว'},
            {icon:'👆',t:'แตะการ์ดในรูปเพื่อซื้อ',d:'ผู้ซื้อแตะการ์ดที่ต้องการในภาพ ใส่ตะกร้าได้ทันที — ไม่ต้อง DM'},
            {icon:'✅',t:'ตรวจสลิปอัตโนมัติ',d:'แนบสลิป → ตรวจ QR เทียบบัญชีและยอด → ผ่านแล้วตัด stock ทันที'},
            {icon:'🔒',t:'ล็อก stock ป้องกัน double-sell',d:'ระบบล็อกการ์ดทันทีที่เริ่ม checkout กันขายซ้ำ 2 คนพร้อมกัน'},
            {icon:'💰',t:'เงินเข้าบัญชีโดยตรง',d:'ผู้ซื้อโอนตรงเข้าบัญชีร้าน ไม่ผ่านมือกลาง ไม่หักค่า fee'},
            {icon:'🔗',t:'Share Link + OG Preview',d:'link พร้อม preview สวยงาม แชร์ Facebook/Line ลูกค้าซื้อต่อได้เลย'},
          ].map((f,i)=>(
            <div key={i} className="group p-7 bg-[#0f0f1a] border border-white/[.08] rounded-2xl hover:border-white/[.15] hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl mb-5 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-2xl">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.t}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="px-[5%] py-20 bg-[#0f0f1a] border-y border-white/[.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs font-semibold text-violet-300 mb-5">🚀 วิธีใช้งาน</div>
        <h2 className="text-4xl font-black tracking-tight mb-12">เริ่มขายได้ใน<br/><span className="gradient-text">3 ขั้นตอน</span></h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-violet-500 via-fuchsia-500 to-transparent" />
          {[
            {n:1,t:'เปิดร้านฟรี',d:'สมัครด้วย Google หรือ email ตั้งชื่อร้าน URL ของตัวเอง ผูกบัญชีรับเงิน เสร็จใน 2 นาที'},
            {n:2,t:'ถ่ายรูปหมู่ → ลงขาย',d:'ถ่ายการ์ดทั้งกองในรูปเดียว ระบบตัดกรอบให้อัตโนมัติ ตั้งราคา แล้วกด "ขึ้นขาย"'},
            {n:3,t:'Share ลิงก์ → รับออเดอร์',d:'Copy link โพสต์ไปแปะ Facebook/Line ลูกค้าซื้อ สลิปผ่านอัตโนมัติ เงินเข้าบัญชีทันที'},
          ].map((s,i)=>(
            <div key={i} className="text-center px-4">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_0_24px_rgba(124,106,240,.4)] flex items-center justify-center text-2xl font-black relative z-10">{s.n}</div>
              <h3 className="font-bold text-xl mb-3">{s.t}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-[5%] py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-xs font-semibold text-violet-300 mb-5">💎 แพ็กเกจ</div>
        <h2 className="text-4xl font-black tracking-tight mb-3">เริ่มต้นฟรี<br/><span className="gradient-text">ไม่มีค่า fee</span></h2>
        <p className="text-zinc-500 mb-14">ในเฟสแรกทุกฟีเจอร์ใช้ฟรีหมด ไม่มีค่าคอมมิชชั่น</p>
        <div className="grid md:grid-cols-3 gap-5 text-left max-w-4xl mx-auto">
          {[
            {tier:'Free',price:'฿0',period:'/เดือน',desc:'เริ่มขายได้เลย',features:['Batch upload ไม่จำกัด','ตรวจสลิปอัตโนมัติ','หน้าร้านส่วนตัว','Dashboard ออเดอร์'],btn:'เริ่มต้นฟรี',primary:false},
            {tier:'Pro',price:'฿299',period:'/เดือน',desc:'สำหรับร้านที่ขายจริงจัง',features:['ทุกอย่างใน Free','Analytics ยอดขาย','Price index การ์ด','Custom domain ร้าน','Priority support'],btn:'เริ่ม 30 วันฟรี',primary:true},
            {tier:'Enterprise',price:'ติดต่อเรา',period:'',desc:'สำหรับร้านใหญ่ / event',features:['ทุกอย่างใน Pro','Multi-admin','API integration','SLA guarantee','Onboarding ส่วนตัว'],btn:'ติดต่อทีมงาน',primary:false},
          ].map((p,i)=>(
            <div key={i} className={`relative rounded-2xl p-8 ${p.primary ? 'border-2 border-violet-500 bg-violet-500/5' : 'border border-white/[.08] bg-[#0f0f1a]'}`}>
              {p.primary && <div className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">ยอดนิยม</div>}
              {p.primary && <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-violet-500 to-fuchsia-500" />}
              <div className="text-sm font-semibold text-zinc-400 mb-3">{p.tier}</div>
              <div className="text-4xl font-black mb-1">{p.price} <span className="text-lg font-semibold text-zinc-500">{p.period}</span></div>
              <div className="text-sm text-zinc-500 mb-7">{p.desc}</div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f,j)=>(
                  <li key={j} className="flex gap-2 text-sm"><span className="text-emerald-400 font-bold flex-shrink-0">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/register" className={`block w-full py-3 rounded-xl text-center text-sm font-bold transition ${p.primary ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_24px_rgba(124,106,240,.4)] hover:opacity-90' : 'border border-white/15 text-white hover:bg-white/5'}`}>
                {p.btn}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mx-[5%] mb-20 px-16 py-20 text-center rounded-3xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/25 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(124,106,240,.25),transparent_70%)] pointer-events-none" />
        <h2 className="text-4xl font-black tracking-tight mb-4">พร้อมขายการ์ด<br/><span className="gradient-text">ง่ายขึ้น 10 เท่า?</span></h2>
        <p className="text-zinc-400 mb-10">เปิดร้านฟรี ไม่ต้องใช้บัตรเครดิต เริ่มได้ใน 2 นาที</p>
        <Link href="/register" className="inline-block px-10 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_40px_rgba(124,106,240,.4)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(124,106,240,.6)] transition-all">
          เปิดร้านฟรีเลย →
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/[.06] px-[5%] py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div>
            <div className="text-2xl font-black gradient-text mb-3">Lalens</div>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">เครื่องมือช่วยขายการ์ดสะสมที่ง่ายที่สุด เริ่มที่ Pokemon และกำลังขยายสู่การ์ดทุกประเภท</p>
          </div>
          <div className="grid grid-cols-3 gap-12 text-sm">
            {[
              {h:'ผู้ขาย',links:['เปิดร้าน','วิธีลงขาย','Dashboard','แพ็กเกจ']},
              {h:'ผู้ซื้อ',links:['วิธีซื้อ','ติดตามออเดอร์','วิธีแนบสลิป','ช่วยเหลือ']},
              {h:'บริษัท',links:['เกี่ยวกับเรา','Privacy Policy','Terms','ติดต่อเรา']},
            ].map((col,i)=>(
              <div key={i}>
                <h5 className="font-bold text-white mb-4">{col.h}</h5>
                <ul className="space-y-2">
                  {col.links.map((l,j)=><li key={j}><a href="#" className="text-zinc-500 hover:text-zinc-300 transition">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-white/[.06] flex flex-col md:flex-row justify-between gap-3 text-xs text-zinc-600">
          <span>© 2026 Lalens. Made with ❤️ สำหรับนักสะสมการ์ด</span>
          <span className="leading-relaxed">⚠️ Lalens เป็นเพียงเครื่องมือช่วยซื้อขาย ไม่รับผิดชอบกรณีโกงหรือข้อพิพาทระหว่างผู้ซื้อและผู้ขาย</span>
        </div>
      </footer>
    </main>
  )
}
