import { useRef, useState, type PointerEvent } from 'react'

type Point = { x: number; y: number }
type WeaveMode = 'snap' | 'free'
type ThreadColor = { name: string; value: string; highlight: string; dark: string }
type Strand = { color: ThreadColor; mode: WeaveMode; points: Point[] }

const WIDTH = 900
const HEIGHT = 420
const pegs = [
  { x: 450, y: 42 }, { x: 760, y: 126 }, { x: 760, y: 294 },
  { x: 450, y: 378 }, { x: 140, y: 294 }, { x: 140, y: 126 },
  { x: 610, y: 210 }, { x: 530, y: 90 }, { x: 370, y: 90 },
  { x: 290, y: 210 }, { x: 370, y: 330 }, { x: 530, y: 330 },
]
const outerHexagon = pegs.slice(0, 6).map((peg) => `${peg.x},${peg.y}`).join(' ')
const innerHexagon = pegs.slice(6).map((peg) => `${peg.x},${peg.y}`).join(' ')
const threadColors: ThreadColor[] = [
  { name: 'Baksteen', value: '#a94238', highlight: '#e49a78', dark: '#67252b' },
  { name: 'Oker', value: '#c18b35', highlight: '#efd18a', dark: '#765326' },
  { name: 'Mos', value: '#66734c', highlight: '#b7bd86', dark: '#3f4934' },
  { name: 'Oranje', value: '#d56f2d', highlight: '#f4b16f', dark: '#8a421f' },
  { name: 'Pruim', value: '#74506f', highlight: '#c3a0bc', dark: '#493348' },
  { name: 'Naturel', value: '#d1b990', highlight: '#f4e7c9', dark: '#816e51' },
]

const toPath = (points: Point[]) => {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  const curved = points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middleX = (previous.x + point.x) / 2
    const middleY = (previous.y + point.y) / 2
    return `${path} Q ${previous.x} ${previous.y} ${middleX} ${middleY}`
  }, `M ${points[0].x} ${points[0].y}`)
  const last = points.at(-1)!
  return `${curved} L ${last.x} ${last.y}`
}

const ThreadWeaver = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [strands, setStrands] = useState<Strand[]>([])
  const [activeColor, setActiveColor] = useState(threadColors[0])
  const [mode, setMode] = useState<WeaveMode>('snap')
  const [weaving, setWeaving] = useState(false)
  const [hoveredPeg, setHoveredPeg] = useState<number | null>(null)

  const pointFromEvent = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = svgRef.current?.getBoundingClientRect()
    if (!bounds) return null
    return {
      x: Math.max(0, Math.min(WIDTH, ((event.clientX - bounds.left) / bounds.width) * WIDTH)),
      y: Math.max(0, Math.min(HEIGHT, ((event.clientY - bounds.top) / bounds.height) * HEIGHT)),
    }
  }

  const closestPeg = (point: Point, maximumDistance = Number.POSITIVE_INFINITY) => {
    let closestIndex = -1
    let closestDistance = maximumDistance
    pegs.forEach((peg, index) => {
      const distance = Math.hypot(point.x - peg.x, point.y - peg.y)
      if (distance < closestDistance) {
        closestIndex = index
        closestDistance = distance
      }
    })
    return closestIndex >= 0 ? { index: closestIndex, point: pegs[closestIndex] } : null
  }

  const startWeaving = (event: PointerEvent<SVGSVGElement>) => {
    const point = pointFromEvent(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const snapped = mode === 'snap' ? closestPeg(point) : null
    setStrands((current) => [...current, { color: activeColor, mode, points: [snapped?.point ?? point] }])
    setHoveredPeg(snapped?.index ?? null)
    setWeaving(true)
  }

  const continueWeaving = (event: PointerEvent<SVGSVGElement>) => {
    if (!weaving) return
    const point = pointFromEvent(event)
    if (!point) return
    const snapped = mode === 'snap' ? closestPeg(point, 62) : null
    setHoveredPeg(snapped?.index ?? null)
    setStrands((current) => {
      const lastStrand = current.at(-1)
      if (!lastStrand) return current
      const nextPoint = snapped?.point ?? (mode === 'free' ? point : null)
      if (!nextPoint) return current
      const previous = lastStrand.points.at(-1)
      const minimumDistance = mode === 'free' ? 4 : 1
      if (previous && Math.hypot(nextPoint.x - previous.x, nextPoint.y - previous.y) < minimumDistance) return current
      return [...current.slice(0, -1), { ...lastStrand, points: [...lastStrand.points, nextPoint] }]
    })
  }

  const stopWeaving = (event: PointerEvent<SVGSVGElement>) => {
    if (mode === 'snap') {
      const point = pointFromEvent(event)
      const snapped = point ? closestPeg(point, 86) : null
      if (snapped) {
        setStrands((current) => {
          const strand = current.at(-1)
          const previous = strand?.points.at(-1)
          if (!strand || (previous?.x === snapped.point.x && previous?.y === snapped.point.y)) return current
          return [...current.slice(0, -1), { ...strand, points: [...strand.points, snapped.point] }]
        })
      }
    }
    setWeaving(false)
    setHoveredPeg(null)
  }
  const lastStrand = strands.at(-1)
  const end = lastStrand?.points.at(-1)
  const beforeEnd = lastStrand?.points.at(-2)
  const needleAngle = end && beforeEnd ? Math.atan2(end.y - beforeEnd.y, end.x - beforeEnd.x) * 180 / Math.PI : 0

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[#8c6b43]/25 bg-[#b78e5c] p-2 shadow-[0_16px_35px_rgba(71,51,31,.18),inset_0_1px_0_rgba(255,255,255,.45)]">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Vrij tekenvlak om met een draad een vorm te weven"
          className="block aspect-[15/7] w-full cursor-grab touch-none select-none rounded-[1rem] active:cursor-grabbing"
          onPointerDown={startWeaving}
          onPointerMove={continueWeaving}
          onPointerUp={stopWeaving}
          onPointerCancel={stopWeaving}
        >
          <defs>
            <linearGradient id="linen-base" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eee4d1" />
              <stop offset=".5" stopColor="#dfd0b7" />
              <stop offset="1" stopColor="#eadfca" />
            </linearGradient>
            <filter id="linen-texture" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="7" result="noise" />
              <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
            </filter>
            <filter id="thread-shadow" x="-12%" y="-12%" width="124%" height="124%">
              <feDropShadow dx="1" dy="4" stdDeviation="3.5" floodColor="#4a2d20" floodOpacity="0.42" />
            </filter>
            <filter id="peg-shadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#3f291b" floodOpacity="0.38" />
            </filter>
            <pattern id="woven-paper" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 0 2.5 H 10 M 0 7.5 H 10 M 2.5 0 V 10 M 7.5 0 V 10" stroke="#745c40" strokeOpacity="0.08" strokeWidth=".65" />
            </pattern>
          </defs>
          <rect width={WIDTH} height={HEIGHT} rx="18" fill="url(#linen-base)" />
          <rect width={WIDTH} height={HEIGHT} rx="18" fill="url(#woven-paper)" opacity=".85" />
          <rect width={WIDTH} height={HEIGHT} rx="18" fill="#aa987d" opacity=".07" filter="url(#linen-texture)" />
          {mode === 'snap' && <g fill="none" stroke="#7f6546" strokeOpacity=".1" strokeWidth="1.25" strokeDasharray="3 11">
            <polygon points={outerHexagon} />
            <polygon points={innerHexagon} />
            {pegs.slice(0, 6).map((peg, index) => (
              <path key={`${peg.x}-guide`} d={`M ${peg.x} ${peg.y} L ${pegs[index + 6].x} ${pegs[index + 6].y} L ${pegs[(index + 2) % 6].x} ${pegs[(index + 2) % 6].y}`} />
            ))}
          </g>}

          {mode === 'snap' && pegs.map((peg, index) => (
            <g key={`${peg.x}-${peg.y}`} filter="url(#peg-shadow)">
              {hoveredPeg === index && <circle cx={peg.x} cy={peg.y} r="24" fill="none" stroke={activeColor.value} strokeWidth="3" opacity=".65" />}
              <circle cx={peg.x} cy={peg.y} r={hoveredPeg === index ? 14 : 12} fill="#735338" />
              <circle cx={peg.x - 2} cy={peg.y - 3} r={hoveredPeg === index ? 10 : 8} fill={index % 3 === 0 ? '#c6a978' : '#9d7750'} />
              <circle cx={peg.x - 4} cy={peg.y - 5} r="2.5" fill="#ead8b6" opacity=".7" />
            </g>
          ))}

          {strands.map((strand, index) => {
            const isActiveStrand = index === strands.length - 1
            const path = strand.mode === 'snap'
              ? strand.points.map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
              : toPath(strand.points)
            return path && (
              <g key={index} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={isActiveStrand ? 1 : .78}>
                <path d={path} stroke="#4d2925" strokeOpacity=".25" strokeWidth={isActiveStrand ? 16 : 14} filter="url(#thread-shadow)" />
                <path d={path} stroke={strand.color.value} strokeWidth={isActiveStrand ? 10 : 8.5} />
                <path d={path} stroke={strand.color.highlight} strokeOpacity=".62" strokeWidth="2.2" strokeDasharray="2 7" />
                <path d={path} stroke={strand.color.dark} strokeOpacity=".58" strokeWidth="1.5" strokeDasharray="8 6" strokeDashoffset="5" />
              </g>
            )
          })}
          {end && lastStrand && lastStrand.points.length > 1 && (
            <g transform={`translate(${end.x} ${end.y}) rotate(${needleAngle})`} filter="url(#peg-shadow)">
              <path d="M -8 0 L 30 0" stroke="#d7d3c9" strokeWidth="5" strokeLinecap="round" />
              <path d="M 28 0 L 38 0" stroke="#f4f1e9" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="-9" cy="0" rx="7" ry="4.5" fill="none" stroke="#d7d3c9" strokeWidth="3" />
            </g>
          )}
        </svg>
        {strands.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center">
            <div className="rounded-full border border-[#795d3f]/20 bg-[#efe5d4]/80 px-6 py-4 shadow-sm backdrop-blur-sm"><p className="max-w-xs text-[10px] uppercase leading-6 tracking-[0.18em] text-neutral-600">{mode === 'snap' ? 'Begin bij een punt en leid de draad naar het volgende' : 'Pak de naald vast en beweeg vrij'}</p></div>
          </div>
        )}
      </div>
      <div className="space-y-2.5 px-3 pb-2 pt-3 text-[#f7eddd]">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div>
            <span className="mb-1.5 block text-[8px] uppercase tracking-[0.16em] text-white/70">Kleur · {activeColor.name}</span>
            <div className="flex items-center gap-2" aria-label="Kies een kleur garen">
            {threadColors.map((color) => <button key={color.name} type="button" onClick={() => setActiveColor(color)} aria-label={color.name} aria-pressed={activeColor.name === color.name} className={`relative h-7 w-7 rounded-full border-2 shadow-sm transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${activeColor.name === color.name ? 'scale-105 border-white ring-2 ring-[#6f5136] ring-offset-2 ring-offset-[#b78e5c]' : 'border-white/35'}`} style={{ backgroundColor: color.value }}>
              {activeColor.name === color.name && <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.8)]">✓</span>}
            </button>)}
            </div>
          </div>
          <div className="flex rounded-full border border-white/30 bg-black/5 p-1">
            <button type="button" onClick={() => setMode('snap')} className={`rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.13em] ${mode === 'snap' ? 'bg-[#f0e4cf] text-[#5b432e]' : ''}`}>Strak weven</button>
            <button type="button" onClick={() => setMode('free')} className={`rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.13em] ${mode === 'free' ? 'bg-[#f0e4cf] text-[#5b432e]' : ''}`}>Vrij haken</button>
          </div>
        </div>
        <div className="flex min-h-10 items-center justify-between border-t border-white/20 pt-2">
          <span className="text-[9px] uppercase tracking-[0.15em]">{strands.length > 0 ? `${strands.length} ${strands.length === 1 ? 'draadgang' : 'draadgangen'}` : 'Kies een kleur en begin'}</span>
          <button type="button" onClick={() => setStrands((current) => current.slice(0, -1))} disabled={strands.length === 0} className="rounded-full border border-white/35 bg-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.14em] transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-35">Laatste draad los</button>
        </div>
      </div>
    </div>
  )
}

export default ThreadWeaver
