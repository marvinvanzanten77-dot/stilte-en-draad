import SpokenWordPlayer from '../components/SpokenWordPlayer'

const DeLaatsteDraad = () => (
  <article className="overflow-hidden rounded-2xl bg-[#ded2bd] shadow-soft ring-1 ring-neutral-200/40">
    <div className="relative overflow-hidden">
      <img
        src="/photos/de-laatste-draad.jpg"
        alt="Een stil atelier aan het einde van de werkdag"
        width="933"
        height="1400"
        className="max-h-[72vh] w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/70 to-transparent p-7 pt-24 text-white md:p-10">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.18em]">De Laatste Draad</h1>
      </div>
    </div>
    <div className="p-5 md:p-8">
      <SpokenWordPlayer id="de-laatste-draad" />
    </div>
  </article>
)

export default DeLaatsteDraad
