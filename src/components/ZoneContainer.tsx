import type { ComponentType } from 'react'
import type { ZoneId } from '../App'
import DeEersteDraad from '../zones/DeEersteDraad'
import Veld from '../zones/Veld'
import Droom from '../zones/Droom'
import Textiel from '../zones/Textiel'
import Ritueel from '../zones/Ritueel'
import Stilte from '../zones/Stilte'

type ZoneContainerProps = {
  activeZone: ZoneId
  onZoneChange?: (zone: ZoneId) => void
}

const zoneComponents: Record<ZoneId, ComponentType> = {
  'de-eerste-draad': DeEersteDraad,
  veld: Veld,
  droom: Droom,
  textiel: Textiel,
  ritueel: Ritueel,
  stilte: Stilte,
}

const ZoneContainer = ({ activeZone }: ZoneContainerProps) => {
  const ActiveZone = zoneComponents[activeZone]

  return (
    <section className="flex-1">
      <ActiveZone />
    </section>
  )
}

export default ZoneContainer
