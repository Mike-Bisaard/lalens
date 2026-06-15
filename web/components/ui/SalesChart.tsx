'use client'

// SVG area chart — รับ data array (ยอดขายรายวัน) render เป็น red fill area chart
export function SalesChart({ data }: { data: number[] }) {
  const W = 600
  const H = 110
  const PAD = { top: 8, right: 4, bottom: 4, left: 4 }

  const points = data.length > 1 ? data : Array(30).fill(0)
  const max = Math.max(...points, 1)
  const n = points.length

  function x(i: number) { return PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right) }
  function y(v: number) { return PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom) }

  // Smooth path using cardinal spline
  function smoothPath() {
    if (n < 2) return ''
    const pts = points.map((v, i) => [x(i), y(v)] as [number, number])
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1]
      const [cx, cy] = pts[i]
      const mx = (px + cx) / 2
      d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`
    }
    return d
  }

  const linePath = smoothPath()
  const areaPath = linePath
    ? `${linePath} L ${x(n - 1)} ${H} L ${x(0)} ${H} Z`
    : ''

  const hasData = points.some(v => v > 0)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: H, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ee1c25" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#ee1c25" stopOpacity="0.01"/>
        </linearGradient>
      </defs>

      {hasData ? (
        <>
          <path d={areaPath} fill="url(#chartFill)"/>
          <path d={linePath} fill="none" stroke="#ee1c25" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Peak dot */}
          {(() => {
            const peakIdx = points.indexOf(max)
            const px = x(peakIdx)
            const py = y(max)
            return (
              <g>
                <circle cx={px} cy={py} r="5" fill="#ee1c25"/>
                <circle cx={px} cy={py} r="3" fill="#fff"/>
                {/* Tooltip */}
                <rect x={px - 44} y={py - 32} width={88} height={24} rx={7} fill="#1c1b24"/>
                <text x={px} y={py - 16} textAnchor="middle" fill="#fff" fontSize={11} fontFamily='"Kanit",sans-serif' fontWeight={700}>
                  ฿{max.toLocaleString('th-TH')}
                </text>
                <text x={px} y={py - 6} textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize={9} fontFamily='"Anuphan",sans-serif'>
                  วันที่ขายดีสุด
                </text>
              </g>
            )
          })()}
        </>
      ) : (
        // Empty state — dashed baseline
        <path
          d={`M ${PAD.left} ${H - PAD.bottom} L ${W - PAD.right} ${H - PAD.bottom}`}
          stroke="#ededf0" strokeWidth="1.5" strokeDasharray="4 4" fill="none"
        />
      )}
    </svg>
  )
}
