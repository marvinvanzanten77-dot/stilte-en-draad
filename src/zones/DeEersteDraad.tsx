import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

type Page = 1 | 2 | 3

const textures = {
  page1:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23e7ddc9'/%3E%3Cstop offset='100%25' stop-color='%23d4c7b2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23g1)'/%3E%3Cpath d='M0 120h1200M0 240h1200M0 360h1200M0 480h1200' stroke='%23cbbca0' stroke-width='0.8' stroke-opacity='0.35'/%3E%3Cpath d='M120 0v600M360 0v600M600 0v600M840 0v600M1080 0v600' stroke='%23c1b190' stroke-width='0.8' stroke-opacity='0.35'/%3E%3C/</svg%3E",
  page2:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23d9ccb5'/%3E%3Cstop offset='100%25' stop-color='%23cbbca0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23g2)'/%3E%3Cpath d='M0 50c120 32 240 32 360 0s240-32 360 0 240 32 360 0 240-32 360 0' stroke='%23bbae93' stroke-width='1.1' stroke-opacity='0.35' fill='none'/%3E%3C/</svg%3E",
  page3:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Cdefs%3E%3ClinearGradient id='g3' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23d6c8af'/%3E%3Cstop offset='100%25' stop-color='%23c6b79c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='600' fill='url(%23g3)'/%3E%3Cpath d='M80 520c60-50 140-80 240-66s220 66 320 62 180-56 240-82 120-22 200 8' stroke='%23b8a98f' stroke-width='1.2' stroke-opacity='0.35' fill='none'/%3E%3C/</svg%3E",
}

// ###panning images###
// Pas de x/y (0-100%) aan voor interne panning zonder het beeld te schalen.
const imagePan: Record<Page, { x: number; y: number }> = {
  1: { x: 50, y: 35 },
  2: { x: 50, y: 50 },
  3: { x: 50, y: 50 },
}

const pageContent: Record<
  Page,
  {
    title: string
    line?: string
    footer?: string
    next?: Page
    image: string
  }
> = {
  1: {
    title: 'DE EERSTE DRAAD',
    line: 'Alles begint met één draad.',
    footer: 'STAP BINNEN',
    next: 2,
    image: '/photos/jannie-2.jpg',
  },
  2: {
    title: 'HET RITME BEGINT',
    line: 'Stilte is het weefgetouw.',
    footer: 'GA VERDER',
    next: 3,
    image: textures.page2,
  },
  3: {
    title: 'JE STAPT HET WEEFSEL IN',
    line: 'Je staat aan de rand van haar wereld.',
    footer: 'De portalen openen zich.',
    image: textures.page3,
  },
}

const flipVariants = {
  initial: { rotateY: 10, opacity: 0.4 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -10, opacity: 0.0 },
}

const DeEersteDraad = () => {
  const [page, setPage] = useState<Page>(1)
  const content = useMemo(() => pageContent[page], [page])

  return (
    <div
      className="group relative min-h-[420px] overflow-hidden rounded-2xl p-9 shadow-soft ring-1 ring-neutral-200/40 transition-all duration-500 ease-out md:min-h-[560px] md:p-12"
      style={{
        background:
          'radial-gradient(circle at 26% 68%, rgba(255,255,255,0.58), transparent 40%), radial-gradient(circle at 78% 76%, rgba(255,255,255,0.42), transparent 36%), linear-gradient(180deg, #cbbca0, #d9ccb5)',
      }}
    >
      <div
        className="flex h-full flex-col items-center justify-between gap-10 md:gap-14"
        style={{ perspective: '1400px' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between gap-8 md:gap-12"
          >
            <header className="text-center uppercase tracking-[0.16em] text-sm text-neutral-700">
              <div className="text-lg font-semibold text-neutral-900">{content.title}</div>
              {content.line && (
                <div className="mt-2 text-xs font-medium text-neutral-600 md:text-sm">
                  {content.line}
                </div>
              )}
            </header>

            <div className="flex w-full flex-1 items-center justify-center">
              <div
                className="image-frame max-w-2xl transition-all duration-700 ease-out"
                style={{
                  backgroundImage: `url("${content.image}")`,
                  backgroundPosition: `${imagePan[page].x}% ${imagePan[page].y}%`,
                }}
              />
            </div>

            <div className="flex w-full justify-center">
              {content.next ? (
                <button
                  type="button"
                  onClick={() => setPage(content.next!)}
                  className="p-0 text-center text-sm uppercase tracking-[0.18em] text-neutral-700 transition-colors duration-300 ease-out hover:text-neutral-900 focus-visible:outline-none md:text-base"
                >
                  {content.footer}
                </button>
              ) : (
                <div className="text-center text-xs uppercase tracking-[0.18em] text-neutral-700 md:text-sm">
                  {content.footer}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DeEersteDraad
