'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
        background: copied ? '#e8f9ef' : '#fff',
        border: `1.5px solid ${copied ? '#2e9e4f' : '#ededf0'}`,
        borderRadius: 9, padding: '6px 11px',
        fontFamily: '"Kanit", sans-serif', fontWeight: 600, fontSize: 12.5,
        color: copied ? '#2e9e4f' : '#1c1b24',
        cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          คัดลอกแล้ว
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          คัดลอก
        </>
      )}
    </button>
  )
}
