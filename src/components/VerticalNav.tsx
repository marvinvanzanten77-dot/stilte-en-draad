import { useState } from 'react'
import type { ZoneId } from '../data/zones'

type Props = { zones: { id: ZoneId; label: string }[]; activeZone: ZoneId; onSelect: (id: ZoneId) => void; navigate: (path: string) => void }
const VerticalNav = ({ zones, activeZone, onSelect, navigate }: Props) => {
  const [open, setOpen] = useState(false)
  const choose = (id: ZoneId) => { onSelect(id); setOpen(false) }
  return <nav className="w-full md:sticky md:top-8 md:h-fit md:w-52 lg:w-60" aria-label="Hoofdnavigatie">
    <div className="flex items-center justify-between md:block">
      <button type="button" onClick={() => choose('de-eerste-draad')}><img src="/logo.png" alt="Stilte & Draad home" className="h-16 w-16 object-contain md:h-24 md:w-24" /></button>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="rounded-full border border-neutral-800/20 bg-white/45 px-4 py-2 text-xs uppercase tracking-[0.16em] md:hidden">{open ? 'Sluiten' : 'Menu'}</button>
      <ul className={`${open ? 'flex' : 'hidden'} absolute left-4 right-4 top-24 z-40 flex-col gap-4 rounded-2xl bg-[#f8f4ec]/95 p-6 shadow-soft backdrop-blur-md md:static md:mt-7 md:flex md:bg-transparent md:p-0 md:shadow-none`}>
        {zones.map((zone) => <li key={zone.id}><button type="button" onClick={() => choose(zone.id)} aria-current={zone.id === activeZone ? 'page' : undefined} className={`relative text-left text-xs font-semibold uppercase tracking-[0.18em] transition md:pl-4 ${zone.id === activeZone ? 'text-neutral-950 before:absolute before:left-0 before:top-1/2 before:h-px before:w-2 before:bg-[#b69664]' : 'text-neutral-500 hover:text-neutral-900'}`}>{zone.label}</button></li>)}
        <li className="mt-2 border-t border-neutral-800/10 pt-4 md:hidden"><button type="button" onClick={() => { navigate('/privacy'); setOpen(false) }} className="text-xs uppercase tracking-[0.15em] text-neutral-500">Privacy</button></li>
        <li className="md:hidden"><button type="button" onClick={() => { navigate('/algemene-voorwaarden'); setOpen(false) }} className="text-xs uppercase tracking-[0.15em] text-neutral-500">Voorwaarden</button></li>
      </ul>
    </div>
  </nav>
}
export default VerticalNav
