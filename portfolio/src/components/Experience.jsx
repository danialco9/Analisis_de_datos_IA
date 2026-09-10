import { EXPERIENCIA, FORMACION, IDIOMAS } from '../data/projects'
import { useReveal } from '../hooks/useReveal'

export default function Experience() {
  const ref = useReveal()

  return (
    <section id="experiencia" className="border-t border-line px-5 py-24 sm:py-32">
      <div ref={ref} className="revelar mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-sky-accent uppercase">
          02 — Trayectoria
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
          Experiencia y formación
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Experiencia laboral */}
          <div>
            <h3 className="font-mono text-xs tracking-widest text-mist uppercase">
              Experiencia laboral
            </h3>

            <div className="mt-6 space-y-5">
              {EXPERIENCIA.map((trabajo) => (
                <article
                  key={`${trabajo.empresa}-${trabajo.puesto}`}
                  className="tarjeta p-6 transition-colors hover:border-sky-accent/30"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="text-lg font-medium text-white">{trabajo.puesto}</h4>
                    <span className="font-mono text-xs text-mist">{trabajo.periodo}</span>
                  </div>
                  <p className="mt-1 text-sm text-sky-accent">{trabajo.empresa}</p>

                  {/* Dato de impacto, cuando el puesto lo tiene */}
                  {trabajo.impacto && (
                    <div className="mt-5 rounded-xl border border-sky-accent/25 bg-sky-accent/8 px-4 py-3">
                      <p className="font-mono text-lg text-white">{trabajo.impacto.valor}</p>
                      <p className="mt-0.5 text-xs text-mist">{trabajo.impacto.etiqueta}</p>
                    </div>
                  )}

                  <ul className="mt-5 space-y-2.5">
                    {trabajo.logros.map((logro, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-mist">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-accent" />
                        {logro}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {trabajo.tecnologias.map((t) => (
                      <span key={t} className="etiqueta">
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Formación e idiomas */}
          <div>
            <h3 className="font-mono text-xs tracking-widest text-mist uppercase">Formación</h3>

            <div className="relative mt-6">
              <div className="absolute top-2 bottom-2 left-[7px] w-px bg-linear-to-b from-violet-accent/60 via-line to-transparent" />
              <ul className="space-y-7">
                {FORMACION.map((estudio) => (
                  <li key={estudio.titulo} className="relative pl-8">
                    <span className="absolute top-1.5 left-0 flex h-4 w-4 items-center justify-center rounded-full border border-line bg-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-accent" />
                    </span>
                    <p className="font-mono text-xs text-mist">{estudio.periodo}</p>
                    <h4 className="mt-1 text-sm leading-snug font-medium text-white">
                      {estudio.titulo}
                    </h4>
                    <p className="mt-0.5 text-sm text-mist">{estudio.centro}</p>
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="mt-12 font-mono text-xs tracking-widest text-mist uppercase">
              Idiomas
            </h3>
            <ul className="mt-5 space-y-3">
              {IDIOMAS.map((i) => (
                <li
                  key={i.idioma}
                  className="flex items-center justify-between border-b border-line/60 pb-3 text-sm"
                >
                  <span className="text-white">{i.idioma}</span>
                  <span className="text-mist">{i.nivel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
