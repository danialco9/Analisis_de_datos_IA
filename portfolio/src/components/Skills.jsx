import { SKILLS } from '../data/projects'
import { useReveal } from '../hooks/useReveal'

export default function Skills() {
  const ref = useReveal()

  return (
    <section id="skills" className="border-t border-line px-5 py-24 sm:py-32">
      <div ref={ref} className="revelar mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-sky-accent uppercase">
          05 — Stack
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
          Herramientas que uso a diario
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((grupo) => (
            <div
              key={grupo.area}
              className="tarjeta group p-6 transition-colors hover:border-sky-accent/30"
            >
              <h3 className="text-sm font-medium text-white">{grupo.area}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {grupo.items.map((item) => (
                  <li key={item} className="etiqueta">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
