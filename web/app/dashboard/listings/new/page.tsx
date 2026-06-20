'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'

interface DetectedCard {
  index: number
  imageDataUrl: string
  name: string
  price: string
  condition: string
}

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload')
  const [uploading, setUploading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [cards, setCards] = useState<DetectedCard[]>([])
  const [originalFile, setOriginalFile] = useState<File | null>(null)

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setOriginalFile(file)
    setDetecting(true)
    setDetectError(null)

    const MAX_MB = 20
    if (file.size > MAX_MB * 1024 * 1024) {
      setDetecting(false)
      setDetectError(`ไฟล์ใหญ่เกินไป (สูงสุด ${MAX_MB} MB)`)
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', file)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000)

      let res: Response
      try {
        res = await fetch('/api/upload/detect', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeout)
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 413 || err.error === 'file_too_large') {
          throw new Error('ไฟล์ใหญ่เกินไป (สูงสุด 20 MB)')
        }
        if (res.status === 504 || err.error === 'detection_timeout') {
          throw new Error('ใช้เวลานานเกินไป — ลองรูปที่เล็กกว่านี้ หรือลดจำนวนการ์ดต่อรูป')
        }
        throw new Error(err.error ?? `เกิดข้อผิดพลาด (${res.status})`)
      }

      const data = await res.json()

      if (!data.cards?.length) {
        throw new Error('ไม่พบการ์ดในรูป — ลองถ่ายบนพื้นที่ตัดกัน (พื้นดำ/ขาว) และให้แสงเพียงพอ')
      }

      setCards(data.cards.map((c: { index: number; imageDataUrl: string }) => ({
        ...c,
        name: '',
        price: '',
        condition: 'NM',
      })))
      setStep('review')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setDetectError('หมดเวลา — ลองรูปที่เล็กกว่านี้ หรือลดจำนวนการ์ดต่อรูป')
      } else {
        setDetectError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด')
      }
    } finally {
      setDetecting(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  async function handlePublish() {
    if (!originalFile) return
    setUploading(true)

    const formData = new FormData()
    formData.append('image', originalFile)
    formData.append('cards', JSON.stringify(cards))

    const res = await fetch('/api/upload/publish', { method: 'POST', body: formData })
    setUploading(false)
    if (res.ok) {
      const { batchId } = await res.json()
      router.push(`/dashboard/listings?new=${batchId}`)
    } else {
      const err = await res.json().catch(() => ({}))
      alert(`เกิดข้อผิดพลาด: ${err.error ?? res.status}`)
    }
  }

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2">ลงขายใหม่</h1>
          <p className="text-zinc-400 mb-8">ถ่ายการ์ดทั้งกองในรูปเดียว — ระบบจะตัดกรอบแยกทุกใบให้</p>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
              isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-5xl mb-4">📸</div>
            <p className="text-lg font-semibold mb-2">
              {isDragActive ? 'วางรูปได้เลย' : 'ลากรูปมาวาง หรือคลิกเพื่อเลือก'}
            </p>
            <p className="text-zinc-500 text-sm">รองรับ JPG, PNG, HEIC — แนะนำถ่ายบนพื้นขาวหรือพื้นมืด</p>
          </div>

          {detecting && (
            <div className="mt-6 flex items-center gap-3 text-violet-400">
              <div className="animate-spin w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full" />
              กำลังตรวจหาการ์ดและตัดกรอบ...
            </div>
          )}

          {detectError && (
            <div className="mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
              <span className="text-xl leading-none mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold text-sm mb-1">ตรวจจับไม่สำเร็จ</p>
                <p className="text-sm text-red-400/80">{detectError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">ตรวจสอบการ์ด {cards.length} ใบ</h1>
            <p className="text-zinc-400 mt-1">ใส่ชื่อ/ราคาให้ครบก่อนขึ้นขาย</p>
          </div>
          <button
            onClick={handlePublish} disabled={uploading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {uploading ? 'กำลังขึ้นขาย...' : `🚀 ขึ้นขาย ${cards.length} ใบ`}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cards.map((card, i) => (
            <div key={card.index} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {card.imageDataUrl ? (
                <img src={card.imageDataUrl} alt={`card-${i}`} className="w-full aspect-[5/7] object-cover" />
              ) : (
                <div className="w-full aspect-[5/7] bg-zinc-800 flex items-center justify-center text-3xl">🃏</div>
              )}
              <div className="p-3 space-y-2">
                <input
                  placeholder="ชื่อการ์ด"
                  value={card.name}
                  onChange={e => setCards(cs => cs.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <input
                  placeholder="ราคา (บาท)"
                  type="text"
                  inputMode="numeric"
                  value={card.price}
                  onChange={e => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    const formatted = digits ? parseInt(digits, 10).toLocaleString('en-US') : ''
                    setCards(cs => cs.map((c, idx) => idx === i ? { ...c, price: formatted } : c))
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <select
                  value={card.condition}
                  onChange={e => setCards(cs => cs.map((c, idx) => idx === i ? { ...c, condition: e.target.value } : c))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  {['NM', 'LP', 'MP', 'HP', 'DMG'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
