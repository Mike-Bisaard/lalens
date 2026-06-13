'use client'

import { useState } from 'react'

interface FAQItem {
  q: string
  a: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number>(0)

  return (
    <div className="flex flex-col gap-3.5 max-w-[760px] mx-auto">
      {items.map((item, i) => {
        const isOpen = openIdx === i
        return (
          <div
            key={i}
            className="bg-white rounded-[18px] overflow-hidden transition-colors duration-200"
            style={{
              border: isOpen ? '1.5px solid var(--ld-red)' : '1.5px solid var(--ld-line)',
            }}
          >
            <button
              onClick={() => setOpenIdx(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-[22px] text-left transition-colors"
              style={{ fontFamily: 'var(--font-kanit), sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ld-ink)' }}
            >
              {item.q}
              <svg
                width="20" height="20" viewBox="0 0 20 20" fill="none"
                style={{ flex: 'none', transition: 'transform .25s', transform: isOpen ? 'rotate(180deg)' : 'none', color: 'var(--ld-red)' }}
              >
                <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              style={{
                maxHeight: isOpen ? 300 : 0,
                overflow: 'hidden',
                transition: 'max-height .3s ease',
              }}
            >
              <p
                className="px-6 pb-[22px]"
                style={{ color: 'var(--ld-muted)', fontSize: 16 }}
              >
                {item.a}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
