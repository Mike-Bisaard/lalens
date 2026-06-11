import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Lalens <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lalens.com'

// ─── Seller: new order arrived ───────────────────────────────────────────────
export async function sendNewOrderEmail(opts: {
  sellerEmail: string
  shopName: string
  orderId: string
  buyerEmail: string
  totalAmount: number   // satang
  itemCount: number
}) {
  const amount = (opts.totalAmount / 100).toLocaleString('th-TH')
  const url = `${APP_URL}/dashboard/orders`

  await resend.emails.send({
    from: FROM,
    to: opts.sellerEmail,
    subject: `🛒 ออเดอร์ใหม่ ฿${amount} — ${opts.shopName}`,
    html: emailLayout(`
      <h2 style="margin:0 0 16px">มีออเดอร์ใหม่เข้ามา!</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#888">จำนวนการ์ด</td><td style="padding:8px 0;font-weight:600">${opts.itemCount} ใบ</td></tr>
        <tr><td style="padding:8px 0;color:#888">ยอดรวม</td><td style="padding:8px 0;font-weight:600;color:#a855f7">฿${amount}</td></tr>
        <tr><td style="padding:8px 0;color:#888">ผู้ซื้อ</td><td style="padding:8px 0">${opts.buyerEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#888">สถานะ</td><td style="padding:8px 0">รอชำระเงิน</td></tr>
      </table>
      <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a21caf);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">
        ดูออเดอร์ใน Dashboard →
      </a>
    `),
  })
}

// ─── Seller: payment confirmed ────────────────────────────────────────────────
export async function sendOrderPaidEmail(opts: {
  sellerEmail: string
  shopName: string
  orderId: string
  buyerEmail: string
  totalAmount: number
  itemCount: number
}) {
  const amount = (opts.totalAmount / 100).toLocaleString('th-TH')
  const url = `${APP_URL}/dashboard/orders`

  await resend.emails.send({
    from: FROM,
    to: opts.sellerEmail,
    subject: `✅ ชำระเงินแล้ว ฿${amount} — ${opts.shopName}`,
    html: emailLayout(`
      <h2 style="margin:0 0 16px">ลูกค้าชำระเงินแล้ว!</h2>
      <p style="color:#888;margin:0 0 20px">ตรวจสลิปผ่านแล้ว กรุณาเตรียมจัดส่ง</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#888">จำนวนการ์ด</td><td style="padding:8px 0;font-weight:600">${opts.itemCount} ใบ</td></tr>
        <tr><td style="padding:8px 0;color:#888">ยอดรวม</td><td style="padding:8px 0;font-weight:600;color:#22c55e">฿${amount}</td></tr>
        <tr><td style="padding:8px 0;color:#888">ผู้ซื้อ</td><td style="padding:8px 0">${opts.buyerEmail}</td></tr>
      </table>
      <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a21caf);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">
        จัดการออเดอร์ →
      </a>
    `),
  })
}

// ─── Buyer: order confirmation ────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(opts: {
  buyerEmail: string
  shopName: string
  orderId: string
  totalAmount: number
  itemCount: number
  expiresAt: string
}) {
  const amount = (opts.totalAmount / 100).toLocaleString('th-TH')
  const trackUrl = `${APP_URL}/orders/${opts.orderId}`
  const expires = new Date(opts.expiresAt).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit',
  })

  await resend.emails.send({
    from: FROM,
    to: opts.buyerEmail,
    subject: `🃏 สรุปออเดอร์จาก ${opts.shopName} — ฿${amount}`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px">ออเดอร์ของคุณ</h2>
      <p style="color:#888;margin:0 0 24px">กรุณาชำระเงินภายใน ${expires} น.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#888">ร้านค้า</td><td style="padding:8px 0;font-weight:600">${opts.shopName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">จำนวนการ์ด</td><td style="padding:8px 0;font-weight:600">${opts.itemCount} ใบ</td></tr>
        <tr><td style="padding:8px 0;color:#888">ยอดรวม</td><td style="padding:8px 0;font-weight:600;color:#a855f7">฿${amount}</td></tr>
      </table>
      <a href="${trackUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a21caf);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">
        ดูสถานะออเดอร์ →
      </a>
      <p style="color:#555;font-size:13px;margin-top:24px">
        หากไม่ได้สั่งซื้อ ไม่ต้องทำอะไร ออเดอร์จะหมดอายุอัตโนมัติ
      </p>
    `),
  })
}

// ─── Buyer: payment verified, waiting for shipment ───────────────────────────
export async function sendPaymentVerifiedEmail(opts: {
  buyerEmail: string
  shopName: string
  orderId: string
  totalAmount: number
}) {
  const amount = (opts.totalAmount / 100).toLocaleString('th-TH')
  const trackUrl = `${APP_URL}/orders/${opts.orderId}`

  await resend.emails.send({
    from: FROM,
    to: opts.buyerEmail,
    subject: `✅ ยืนยันการชำระเงิน ฿${amount} — ${opts.shopName}`,
    html: emailLayout(`
      <h2 style="margin:0 0 8px">ยืนยันการชำระเงินแล้ว!</h2>
      <p style="color:#888;margin:0 0 24px">ร้านค้าได้รับการแจ้งเตือนแล้ว กำลังเตรียมจัดส่ง</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:8px 0;color:#888">ร้านค้า</td><td style="padding:8px 0;font-weight:600">${opts.shopName}</td></tr>
        <tr><td style="padding:8px 0;color:#888">ยอดที่ชำระ</td><td style="padding:8px 0;font-weight:600;color:#22c55e">฿${amount}</td></tr>
      </table>
      <a href="${trackUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a21caf);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700">
        ติดตามสถานะ →
      </a>
    `),
  })
}

// ─── Shared layout ────────────────────────────────────────────────────────────
function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f4f4f5">
  <div style="max-width:520px;margin:40px auto;padding:0 16px">
    <div style="margin-bottom:24px">
      <span style="font-size:20px;font-weight:800;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
        Lalens
      </span>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px">
      ${content}
    </div>
    <p style="text-align:center;color:#52525b;font-size:12px;margin-top:24px">
      Lalens · ตลาดซื้อขายการ์ดสะสม · ไม่ต้องการรับอีเมล? <a href="#" style="color:#52525b">ยกเลิก</a>
    </p>
  </div>
</body></html>`
}
