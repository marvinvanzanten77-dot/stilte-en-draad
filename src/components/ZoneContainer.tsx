import { zones, type ZoneId } from '../data/zones'
import DeEersteDraad from '../zones/DeEersteDraad'
import Veld from '../zones/Veld'
import Droom from '../zones/Droom'
import Textiel from '../zones/Textiel'
import Ritueel from '../zones/Ritueel'
import Stilte from '../zones/Stilte'
import Webshop from '../zones/Webshop'
import Evenementen from '../zones/Evenementen'

const ZoneContainer = ({ activeZone, navigate }: { activeZone: ZoneId; navigate: (path: string) => void }) => {
  const content: Record<ZoneId, React.ReactNode> = { 'de-eerste-draad': <DeEersteDraad />, veld: <Veld />, droom: <Droom />, textiel: <Textiel />, ritueel: <Ritueel />, stilte: <Stilte />, webshop: <Webshop navigate={navigate} />, evenementen: <Evenementen /> }
  const index = zones.findIndex((zone) => zone.id === activeZone)
  const previous = zones[index - 1]
  const next = zones[index + 1]
  const pathFor = (id: ZoneId) => id === 'de-eerste-draad' ? '/' : `/${id}`
  return <section>{content[activeZone]}<nav aria-label="Blader door zones" className="mt-5 flex items-center justify-between border-t border-neutral-800/10 pt-5 text-[10px] uppercase tracking-[0.15em] text-neutral-500">{previous ? <button type="button" onClick={() => navigate(pathFor(previous.id))}>← {previous.label}</button> : <span />}{next ? <button type="button" onClick={() => navigate(pathFor(next.id))}>{next.label} →</button> : <span />}</nav></section>
}
export default ZoneContainer
