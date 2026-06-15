'use client'

import { useState } from 'react'

interface CopyButtonProps {
  url: string
  label?: string
  className?: string
  style?: React.CSSProperties
}

const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

export default function CopyButton({ url, label = 'คัดลอกลิงก์', className, style }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard API
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={{
        flex: 1,
        border: copied ? '1.5px solid #2e9e4f' : '1.5px solid #e0dde3',
        background: copied ? '#e9f7ee' : '#fff',
        color: copied ? '#207a3c' : '#1c1b24',
        fontFamily: '"Kanit", sans-serif',
        fontWeight: 600,
        fontSize: 13,
        padding: 9,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        cursor: 'pointer',
        transition: 'border-color 0.15s, color 0.15s, background 0.15s',
        ...style,
      }}
      onMouseEnter={e => {
        if (!copied) {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#ee1c25'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#ee1c25'
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e0dde3'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#1c1b24'
        }
      }}
    >
      {copied ? <IconCheck /> : <IconLink />}
      {copied ? 'คัดลอกแล้ว!' : label}
    </button>
  )
}
