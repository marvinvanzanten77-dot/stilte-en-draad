import LastThreadFilm from '../components/LastThreadFilm'
import SpokenWordPlayer from '../components/SpokenWordPlayer'

const chapters = [
  {
    number: '01',
    title: 'Vasthouden',
    text: 'Eindigen is bepalen wanneer iets goed genoeg is. Misschien blijven we liever bezig omdat zolang de draad beweegt, nog niets definitief hoeft te zijn.',
  },
  {
    number: '02',
    title: 'Omarmen',
    text: 'Ik weef zoals ik het leven beleef: soms recht, soms scheef, maar altijd echt. Volharding brengt mij tot het einde; vertrouwen laat mij dat einde aanvaarden.',
  },
  {
    number: '03',
    title: 'Loslaten',
    text: 'De laatste draad maakt het werk niet leeg. Zij maakt het vrij om zonder mijn handen verder te bestaan — en maakt in mij ruimte voor wat nog geen naam heeft.',
  },
]

const DeLaatsteDraad = () => (
  <article className="overflow-hidden rounded-2xl bg-[#d9cdb9] shadow-soft ring-1 ring-neutral-200/40">
    <header className="grid min-h-[530px] bg-[#312e29] text-[#eee5d6] md:grid-cols-[.9fr_1.1fr]">
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-14">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#c6a978]">De voltooiing</p>
        <h1 className="mt-4 text-3xl font-semibold uppercase tracking-[0.18em] sm:text-4xl">De Laatste Draad</h1>
        <div className="my-7 h-px w-14 bg-[#c6a978]/70" />
        <p className="max-w-lg font-serif text-2xl leading-9 text-[#f3eadc]">Eindigen is moeilijk.<br />Maar ik omarm het eind.</p>
        <p className="mt-6 max-w-lg text-sm leading-7 text-white/65">Niet omdat het verhaal ophoudt, maar omdat iedere vorm een moment nodig heeft waarop de handen stilvallen. Pas dan kan ik zien wat al die draden samen zijn geworden.</p>
        <p className="mt-7 text-[9px] uppercase tracking-[0.18em] text-white/40">Wat komt er na de laatste draad?</p>
      </div>
      <div className="relative min-h-80 overflow-hidden md:min-h-full">
        <img src="/photos/de-laatste-draad.jpg" alt="Jannie in een stil moment aan het einde van het maakproces" width="933" height="1400" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#312e29] via-transparent to-transparent md:block" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#312e29]/65 to-transparent" />
      </div>
    </header>

    <section className="border-t border-white/10 p-7 md:p-12" aria-labelledby="laatste-draad-bewegingen">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Drie bewegingen</p>
      <h2 id="laatste-draad-bewegingen" className="mt-2 text-lg font-semibold uppercase tracking-[0.14em]">Van vasthouden naar loslaten</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {chapters.map((chapter) => <section key={chapter.number} className="min-h-60 rounded-xl border border-white/45 bg-white/20 p-6">
          <span className="font-serif text-2xl text-[#9b7d4f]">{chapter.number}</span>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.14em]">{chapter.title}</h3>
          <p className="mt-4 text-sm leading-7 text-neutral-600">{chapter.text}</p>
          <div className="mt-6 h-px w-8 bg-[#9b7d4f]/50" />
        </section>)}
      </div>
    </section>

    <section className="grid border-t border-neutral-800/10 md:grid-cols-[.92fr_1.08fr]">
      <div className="p-7 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Luister</p>
        <h2 className="mt-3 text-lg font-semibold uppercase tracking-[0.14em]">De Laatste Draad · spoken word</h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-600">Een gesproken overweging over volharding, vertrouwen en het moment waarop doorgaan plaatsmaakt voor overgave.</p>
        <SpokenWordPlayer id="de-laatste-draad" />
      </div>
      <div className="border-t border-neutral-800/10 p-7 md:border-l md:border-t-0 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Ervaar</p>
        <h2 className="mt-3 text-lg font-semibold uppercase tracking-[0.14em]">Wat klaar is, mag veranderen</h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-600">Een zandmandala wordt met geduld opgebouwd en daarna bewust weggeveegd. Niet omdat het maken voor niets was, maar omdat schoonheid niet hoeft te blijven om betekenis te hebben.</p>
        <div className="mt-6"><LastThreadFilm /></div>
      </div>
    </section>

    <footer className="border-t border-neutral-800/10 bg-[#eee5d6]/40 px-7 py-12 text-center md:px-12 md:py-16">
      <p className="font-serif text-2xl leading-9 text-neutral-700">“Wellicht de stem van inspiratie<br />voor een nieuw begin.<br />Wellicht gewoon stilte…”</p>
      <div className="mx-auto my-7 h-px w-12 bg-[#9b7d4f]/50" />
      <p className="mx-auto max-w-lg text-sm leading-7 text-neutral-600">Een einde sluit de cirkel, maar verbreekt de draad niet. Wie opnieuw wil beginnen, vindt de eerste draad altijd terug.</p>
      <a href="/" className="mt-7 inline-block rounded-full border border-neutral-800/20 px-6 py-3 text-[9px] uppercase tracking-[0.17em] transition hover:bg-white/40">Terug naar De Eerste Draad →</a>
    </footer>
  </article>
)

export default DeLaatsteDraad
