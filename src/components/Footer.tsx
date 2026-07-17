type FooterProps = { navigate: (path: string) => void }

const Footer = ({ navigate }: FooterProps) => (
  <footer className="mt-4 border-t border-neutral-800/10 py-7 text-[10px] uppercase tracking-[0.15em] text-neutral-500">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <span>© {new Date().getFullYear()} Stilte &amp; Draad · door Jannie</span>
      <nav aria-label="Juridische informatie" className="flex flex-wrap gap-x-5 gap-y-2">
        <button type="button" onClick={() => navigate('/privacy')} className="hover:text-neutral-900">Privacy</button>
        <button type="button" onClick={() => navigate('/algemene-voorwaarden')} className="hover:text-neutral-900">Algemene voorwaarden</button>
        <button type="button" onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))} className="hover:text-neutral-900">Cookievoorkeuren</button>
      </nav>
    </div>
  </footer>
)

export default Footer
