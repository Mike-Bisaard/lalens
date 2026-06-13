import type { Metadata } from 'next'
import { Inter, Kanit, Anuphan } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
})
const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-anuphan',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lalens.com'

export const metadata: Metadata = {
  title: 'Lalens — ขายการ์ดสะสมง่ายขึ้น 10 เท่า',
  description: 'ถ่ายรูปหมู่ → AI ตัดกรอบ → ผู้ซื้อกดจ่ายได้เลย ไม่ต้องลงขายทีละใบ',
  metadataBase: new URL(APP_URL),
  openGraph: {
    siteName: 'Lalens',
    locale: 'th_TH',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${inter.variable} ${kanit.variable} ${anuphan.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
