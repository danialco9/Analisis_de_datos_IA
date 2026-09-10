export default function ProjectCard({ proyecto, onAbrir }) {
  return (
    <article
      className={`tarjeta group relative flex cursor-pointer flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-accent/40 ${
        proyecto.destacado ? 'sm:col-span-2' : ''
      }`}
      onClick={() => onAbrir(proyecto)}
    >
      {/* Brillo sutil al pasar el raton */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-sky-accent/0 via-transparent to-violet-accent/0 opacity-0 transition-opacity duration-500 group-hover:from-sky-accent/5 group-hover:to-violet-accent/5 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <span className="text-3xl" aria-hidden="true">
          {proyecto.emoji}
        </span>
        <div className="flex items-center gap-2">
          {proyecto.destacado && (
            <span className="rounded-full border border-sky-accent/30 bg-sky-accent/10 px-2.5 py-0.5 text-[0.68rem] text-sky-accent">
              Destacado
            </span>
          )}
          <span className="font-mono text-xs text-mist">{proyecto.periodo}</span>
        </div>
      </div>

      <h3 className="relative mt-5 text-lg leading-snug font-medium text-white">
        {proyecto.titulo}
      </h3>
      <p className="relative mt-1 text-xs text-sky-accent">{proyecto.subtitulo}</p>

      <p className="relative mt-4 flex-1 text-sm leading-relaxed text-mist">
        {proyecto.resumen}
      </p>

      {/* Métricas destacadas solo en la tarjeta grande */}
      {proyecto.destacado && proyecto.metricas && (
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
          {proyecto.metricas.map((m) => (
            <div key={m.etiqueta}>
              <p className="font-mono text-lg text-white">{m.valor}</p>
              <p className="mt-0.5 text-[0.7rem] leading-tight text-mist">{m.etiqueta}</p>
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-6 flex flex-wrap gap-2">
        {proyecto.tecnologias.slice(0, proyecto.destacado ? 7 : 4).map((t) => (
          <span key={t} className="etiqueta">
            {t}
          </span>
        ))}
        {proyecto.tecnologias.length > (proyecto.destacado ? 7 : 4) && (
          <span className="etiqueta">
            +{proyecto.tecnologias.length - (proyecto.destacado ? 7 : 4)}
          </span>
        )}
      </div>

      <p className="relative mt-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors group-hover:text-sky-accent">
        Ver detalle
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </p>
    </article>
  )
}
