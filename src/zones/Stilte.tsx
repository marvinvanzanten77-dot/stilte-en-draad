const stilteImage = '/mood-board/Golden_Atelier_Morning.png'

const Stilte = () => {
  return (
    <div
      className="min-h-[420px] rounded-2xl p-9 shadow-soft ring-1 ring-neutral-200/40 md:min-h-[540px] md:p-12"
      style={{
        background:
          'radial-gradient(circle at 26% 68%, rgba(255,255,255,0.58), transparent 40%), radial-gradient(circle at 78% 76%, rgba(255,255,255,0.42), transparent 36%), linear-gradient(180deg, #cbbca0, #d9ccb5)',
      }}
    >
      <div className="flex h-full flex-col gap-8 md:gap-12">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.18em] text-neutral-900">
          STILTE
        </h1>
        <div className="flex flex-1 items-center justify-center">
          <div
            className="image-frame"
            style={{
              backgroundImage: `url("${stilteImage}")`,
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Stilte
