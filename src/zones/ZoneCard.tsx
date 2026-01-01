type ZoneCardProps = {
  title: string
}

const ZoneCard = ({ title }: ZoneCardProps) => {
  return (
    <div className="min-h-[360px] rounded-2xl bg-white/80 p-10 shadow-soft backdrop-blur-sm md:min-h-[460px] md:p-12">
      <h1 className="text-3xl font-semibold uppercase tracking-[0.18em] text-neutral-900">
        {title}
      </h1>
    </div>
  )
}

export default ZoneCard
