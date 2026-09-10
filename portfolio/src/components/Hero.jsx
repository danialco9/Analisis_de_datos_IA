import { useEffect, useState } from 'react'
import { PROJECTS } from '../data/projects'

const ROLES = [
  'analista de datos',
  'ingeniero de machine learning',
  'desarrollador de IA generativa',
]

// El rol mas largo marca el alto que hay que reservar (ver el comentario
// del bloque que lo pinta).
const ROL_MAS_LARGO = ROLES.reduce((a, b) => (b.length > a.length ? b : a))

/** Efecto máquina de escribir que rota entre los roles. */
function useTextoRotativo(textos, { velocidad = 65, pausa = 1800 } = {}) {
  const [indice, setIndice] = useState(0)
  const [texto, setTexto] = useState('')
  const [borrando, setBorrando] = useState(false)

  useEffect(() => {
    const actual = textos[indice % textos.length]

    if (!borrando && texto === actual) {
      const t = setTimeout(() => setBorrando(true), pausa)
      return () => clearTimeout(t)
    }

    if (borrando && texto === '') {
      setBorrando(false)
      setIndice((i) => (i + 1) % textos.length)
      return
    }

    const t = setTimeout(
      () => {
        setTexto((prev) =>
          borrando ? actual.slice(0, prev.length - 1) : actual.slice(0, prev.length + 1),
        )
      },
      borrando ? velocidad / 2 : velocidad,
    )
    return () => clearTimeout(t)
  }, [texto, borrando, indice, textos, velocidad, pausa])

  return texto
}

export default function Hero() {
  const rol = useTextoRotativo(ROLES)
  const totalProyectos = PROJECTS.length

  return (
    <section
      id="inicio"
      className="relative flex min-h-svh items-center overflow-hidden px-5 pt-24 pb-16"
    >
      {/* Fondo decorativo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[10%] h-[36rem] w-[36rem] rounded-full bg-sky-accent/8 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[-15%] h-[30rem] w-[30rem] rounded-full bg-violet-accent/8 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/3 px-3 py-1.5 text-xs text-mist">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-accent opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-accent" />
          </span>
          Data Analyst · Máster en Data Science e IA
        </p>

        <h1 className="max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Convierto datos en
          <br />
          <span className="texto-degradado">decisiones que se entienden</span>
        </h1>

        {/* Los tres roles tienen longitudes distintas y en movil el mas largo
            ocupa dos lineas. Con una altura fija la segunda quedaba cortada,
            asi que el alto lo reserva una copia invisible del texto mas largo:
            nunca se recorta y tampoco da saltos al cambiar de frase. */}
        <p className="relative mt-6 font-mono text-sm text-mist sm:text-lg">
          <span className="invisible" aria-hidden="true">
            &gt; {ROL_MAS_LARGO}_
          </span>
          <span className="absolute inset-0">
            <span className="text-sky-accent">&gt;</span> {rol}
            <span className="cursor-parpadeo ml-0.5 text-sky-accent">_</span>
          </span>
        </p>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist sm:text-lg">
          Soy <span className="text-white">Daniel Alconada Díaz</span>. Vengo del desarrollo web
          y trabajo el recorrido completo del dato: del análisis exploratorio y el modelado
          hasta un producto que alguien pueda usar sin saber que hay un modelo detrás.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#proyectos"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
          >
            Ver proyectos
            <span className="transition-transform group-hover:translate-y-0.5">↓</span>
          </a>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm text-mist transition-colors hover:border-sky-accent/50 hover:text-white"
          >
            Contactar
          </a>
        </div>

        {/* Cifras rápidas */}
        <dl className="mt-16 grid max-w-md grid-cols-2 gap-6 border-t border-line pt-8">
          {[
            { valor: totalProyectos, etiqueta: 'Proyectos publicados' },
            { valor: '2', etiqueta: 'Másteres en datos e IA' },
          ].map((cifra) => (
            <div key={cifra.etiqueta}>
              <dt className="sr-only">{cifra.etiqueta}</dt>
              <dd className="font-mono text-2xl text-white sm:text-3xl">{cifra.valor}</dd>
              <p className="mt-1 text-xs leading-tight text-mist">{cifra.etiqueta}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
