const NotFoundPage = ({ navigate }: { navigate: (path: string) => void }) => (
  <section className="rounded-2xl bg-[#e7ddc9] p-8 text-center shadow-soft md:p-14">
    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">404 · de draad loopt hier niet verder</p>
    <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.16em]">Deze pagina bestaat niet</h1>
    <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-neutral-600">Misschien is de draad verplaatst, of ben je op een plek terechtgekomen die nog geen vorm heeft gekregen.</p>
    <button type="button" onClick={() => navigate('/')} className="mt-7 rounded-full border border-neutral-800/20 px-6 py-3 text-xs uppercase tracking-[0.14em]">Terug naar het begin</button>
  </section>
)

export default NotFoundPage
