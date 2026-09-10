import { useMemo, useState } from 'react'
import { PROJECTS, CATEGORIES } from '../data/projects'
import { useReveal } from '../hooks/useReveal'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'

export default function Projects() {
  const [categoria, setCategoria] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState(null)
  const ref = useReveal()

  // Cuantos proyectos hay en cada categoria, para mostrarlo en los filtros.
  const conteos = useMemo(() => {
    const mapa = { todos: PROJECTS.length }
    for (const p of PROJECTS) mapa[p.categoria] = (mapa[p.categoria] ?? 0) + 1
    return mapa
  }, [])

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return PROJECTS.filter((p) => {
      const coincideCategoria = categoria === 'todos' || p.categoria === categoria
      if (!coincideCategoria) return false
      if (!termino) return true
      // Busca en titulo, resumen y tecnologias.
      return (
        p.titulo.toLowerCase().includes(termino) ||
        p.resumen.toLowerCase().includes(termino) ||
        p.tecnologias.some((t) => t.toLowerCase().includes(termino))
      )
    })
  }, [categoria, busqueda])

  return (
    <section id="proyectos" className="border-t border-line px-5 py-24 sm:py-32">
      <div ref={ref} className="revelar mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-sky-accent uppercase">
          03 — Proyectos
        </p>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
            Del dataset crudo al producto final
          </h2>

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por tecnología..."
              aria-label="Buscar proyectos"
              className="w-full rounded-xl border border-line bg-white/3 py-2.5 pr-4 pl-9 text-sm text-white placeholder:text-mist/70 focus:border-sky-accent/50 focus:outline-none"
            />
            <span
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-mist"
              aria-hidden="true"
            >
              ⌕
            </span>
          </div>
        </div>

        {/* Filtros por categoría */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const activa = categoria === cat.id
            const total = conteos[cat.id] ?? 0
            if (!total) return null
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoria(cat.id)}
                aria-pressed={activa}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  activa
                    ? 'border-sky-accent/40 bg-sky-accent/10 text-white'
                    : 'border-line text-mist hover:border-sky-accent/30 hover:text-white'
                }`}
              >
                {cat.label}
                <span className="ml-2 font-mono text-xs opacity-60">{total}</span>
              </button>
            )
          })}
        </div>

        {/* Rejilla de proyectos */}
        {visibles.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((p) => (
              <ProjectCard key={p.id} proyecto={p} onAbrir={setAbierto} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
            <p className="text-mist">
              Ningún proyecto coincide con{' '}
              <span className="text-white">"{busqueda}"</span>
              {categoria !== 'todos' && ' en esta categoría'}.
            </p>
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setCategoria('todos')
              }}
              className="mt-4 text-sm text-sky-accent underline underline-offset-4 hover:text-white"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <ProjectModal proyecto={abierto} onCerrar={() => setAbierto(null)} />
    </section>
  )
}
