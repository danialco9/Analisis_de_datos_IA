import { useEffect, useRef } from 'react'

export default function ProjectModal({ proyecto, onCerrar }) {
  const panelRef = useRef(null)

  // Cerrar con Escape y bloquear el scroll del fondo mientras esta abierto.
  useEffect(() => {
    if (!proyecto) return

    const alPulsar = (e) => {
      if (e.key === 'Escape') onCerrar()
    }

    document.addEventListener('keydown', alPulsar)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', alPulsar)
      document.body.style.overflow = ''
    }
  }, [proyecto, onCerrar])

  if (!proyecto) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-ink/85 p-4 backdrop-blur-sm sm:p-8"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animar-modal my-auto w-full max-w-3xl rounded-2xl border border-line bg-ink-soft outline-none"
      >
        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-2xl border-b border-line bg-ink-soft/95 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl" aria-hidden="true">
              {proyecto.emoji}
            </span>
            <div>
              <h2
                id="titulo-modal"
                className="text-xl leading-snug font-semibold text-white sm:text-2xl"
              >
                {proyecto.titulo}
              </h2>
              <p className="mt-1 text-sm text-sky-accent">
                {proyecto.subtitulo} · {proyecto.periodo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar el detalle del proyecto"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-base text-mist transition-colors hover:border-sky-accent/50 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-9 px-6 py-8 sm:px-8">
          {/* Métricas */}
          {proyecto.metricas && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {proyecto.metricas.map((m) => (
                <div key={m.etiqueta} className="rounded-xl border border-line bg-white/2 p-4">
                  <p className="font-mono text-xl text-white">{m.valor}</p>
                  <p className="mt-1 text-[0.7rem] leading-tight text-mist">{m.etiqueta}</p>
                </div>
              ))}
            </div>
          )}

          {/* Descripción */}
          <div className="space-y-4 text-sm leading-relaxed text-mist sm:text-base">
            {proyecto.descripcion?.map((parrafo, i) => <p key={i}>{parrafo}</p>)}
          </div>

          {/* Diagrama de flujo, si el proyecto lo tiene definido */}
          {proyecto.diagrama && (
            <div>
              <h3 className="mb-4 text-sm font-medium text-white">Arquitectura</h3>
              <ol className="flex flex-wrap items-stretch gap-2">
                {proyecto.diagrama.map((paso, i) => (
                  <li key={paso.nodo} className="flex items-center gap-2">
                    <div className="rounded-xl border border-line bg-white/2 px-4 py-3">
                      <p className="text-sm text-white">{paso.nodo}</p>
                      <p className="mt-0.5 text-[0.7rem] text-mist">{paso.detalle}</p>
                    </div>
                    {i < proyecto.diagrama.length - 1 && (
                      <span className="text-sky-accent" aria-hidden="true">
                        →
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tabla de resultados */}
          {proyecto.tabla && (
            <div>
              <h3 className="mb-4 text-sm font-medium text-white">{proyecto.tabla.titulo}</h3>
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-white/2">
                    <tr>
                      {proyecto.tabla.cabeceras.map((c) => (
                        <th key={c} className="px-4 py-3 font-medium text-white">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proyecto.tabla.filas.map((fila) => (
                      <tr key={fila[0]} className="border-b border-line/50 last:border-0">
                        {fila.map((celda, i) => (
                          <td
                            key={i}
                            className={`px-4 py-3 ${
                              i === 0 ? 'text-mist' : 'font-mono text-white'
                            }`}
                          >
                            {celda}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gráficas reales del proyecto */}
          {proyecto.imagenes && (
            <div>
              <h3 className="mb-4 text-sm font-medium text-white">Resultados visuales</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {proyecto.imagenes.map((img) => (
                  <figure
                    key={img.src}
                    className="overflow-hidden rounded-xl border border-line bg-white"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="w-full object-contain"
                    />
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* Nota tecnica, cuando el proyecto necesita una aclaracion */}
          {proyecto.nota && (
            <div className="rounded-xl border border-line bg-white/2 px-5 py-4">
              <h3 className="text-sm font-medium text-white">{proyecto.nota.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{proyecto.nota.texto}</p>
            </div>
          )}

          {/* Aprendizaje */}
          {proyecto.aprendizajes && (
            <blockquote className="rounded-xl border border-line border-l-2 border-l-sky-accent bg-white/2 px-5 py-4">
              <p className="font-mono text-[0.7rem] tracking-widest text-sky-accent uppercase">
                Lo que me llevo
              </p>
              <p className="mt-2 text-sm leading-relaxed text-mist italic">
                {proyecto.aprendizajes}
              </p>
            </blockquote>
          )}

          {/* Tecnologías y enlace */}
          <div className="border-t border-line pt-6">
            <div className="flex flex-wrap gap-2">
              {proyecto.tecnologias.map((t) => (
                <span key={t} className="etiqueta">
                  {t}
                </span>
              ))}
            </div>
            <a
              href={proyecto.enlace}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Ver código en GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
