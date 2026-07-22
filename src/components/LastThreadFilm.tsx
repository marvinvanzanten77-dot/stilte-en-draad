import { useState } from 'react'

const LastThreadFilm = () => {
  const [available, setAvailable] = useState(false)

  return <figure>
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#292722] shadow-[0_14px_30px_rgba(62,48,33,.22)]">
      <video
        controls={available}
        preload="metadata"
        src="/videos/eindigen-is-loslaten.mp4"
        poster="/videos/eindigen-is-loslaten-poster.png"
        onLoadedMetadata={() => setAvailable(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${available ? 'opacity-100' : 'opacity-0'}`}
      >
        Je browser ondersteunt deze video niet.
      </video>
      {!available && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(198,169,120,.16),transparent_42%)] p-8 text-center text-[#eee5d6]">
        <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/[.06] pl-1 text-sm text-white/60">▶</span>
        <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-[#c6a978]">Film in wording</p>
        <h3 className="mt-2 text-sm font-semibold uppercase tracking-[0.14em]">Eindigen is loslaten</h3>
        <p className="mt-3 max-w-sm text-xs leading-5 text-white/45">De speler wordt actief zodra de film over de zandmandala is toegevoegd.</p>
      </div>}
    </div>
    <figcaption className="mt-3 text-center font-serif text-sm italic text-neutral-500">Wat met volledige aandacht is gemaakt, mag ook met volledige aandacht worden losgelaten.</figcaption>
  </figure>
}

export default LastThreadFilm
