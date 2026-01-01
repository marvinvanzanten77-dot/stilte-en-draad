import type { ZoneId } from '../App'

type ZoneItem = {
  id: ZoneId
  label: string
}

type VerticalNavProps = {
  zones: ZoneItem[]
  activeZone: ZoneId
  onSelect: (id: ZoneId) => void
}

const VerticalNav = ({ zones, activeZone, onSelect }: VerticalNavProps) => {
  return (
    <nav className="w-full md:w-56 lg:w-64" aria-label="Zones">
      <div className="flex items-start gap-4">
        <img
          src="/logo.png"
          alt="Stilte &amp; Draad logo"
          className="h-20 w-20 flex-shrink-0 object-contain"
        />
        <ul className="flex flex-wrap items-start gap-3 md:flex-col md:gap-5">
          {zones.map((zone) => {
            const isActive = zone.id === activeZone
            return (
              <li key={zone.id}>
                <button
                  type="button"
                  onClick={() => onSelect(zone.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className="group relative block bg-transparent p-0 text-left font-semibold uppercase tracking-[0.2em] text-xs text-neutral-600 outline-none md:text-sm"
                >
                  <span className={isActive ? 'text-neutral-900' : undefined}>
                    {zone.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 top-full block h-[2px] w-full bg-neutral-800 transition-opacity duration-200 ease-linear md:-left-3 md:top-1/2 md:h-10 md:w-[2px] md:-translate-y-1/2 md:rounded-full ${
                      isActive ? 'opacity-80' : 'opacity-0'
                    }`}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default VerticalNav
