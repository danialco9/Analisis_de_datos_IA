import { useReveal } from '../hooks/useReveal'

const RECORRIDO = [
  {
    fase: 'Desarrollo web',
    detalle:
      'Grado Superior en Desarrollo de Aplicaciones Web y un primer puesto como front-end. De ahí viene el criterio de interfaz y la obsesión por que las cosas se entiendan.',
  },
  {
    fase: 'Datos y estadística',
    detalle:
      'Análisis exploratorio, calidad del dato, contraste de hipótesis y modelado relacional en SQL. Aprender a distinguir una relación real de una casualidad.',
  },
  {
    fase: 'Automatización profesional',
    detalle:
      'Integración de datos fiscales de fuentes dispares y procesos en Python que recortaron días de trabajo manual por cliente.',
  },
  {
    fase: 'Machine Learning e IA',
    detalle:
      'Pipelines sin fuga de información, tratamiento del desbalance, deep learning para texto y agentes con RAG.',
  },
]

export default function About() {
  const ref = useReveal()

  return (
    <section id="sobre-mi" className="border-t border-line px-5 py-24 sm:py-32">
      <div ref={ref} className="revelar mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-sky-accent uppercase">
          01 — Sobre mí
        </p>

        <div className="mt-8 grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
              Un modelo que nadie entiende
              <br />
              <span className="text-mist">no sirve de nada</span>
            </h2>

            <div className="mt-7 space-y-5 text-base leading-relaxed text-mist">
              <p>
                Soy analista de datos, pero no llegué aquí por el camino habitual: empecé
                programando web. Esa base de front-end es la que me hace pensar siempre en quién
                va a mirar el resultado, y no solo en si el número es correcto.
              </p>
              <p>
                En mi último puesto como analista fiscal automaticé procesos que se hacían a
                mano para un centenar de clientes, integrando datos que llegaban en CSV, en
                Excel y por API. Lo que antes costaba dos o tres días por cliente pasó a
                resolverse en uno o menos. Ese es el tipo de problema que me gusta: el que se
                mide en tiempo que alguien deja de perder.
              </p>
              <p>
                También intento ser honesto con los límites. Cuando un dataset es pequeño,
                cuando una variable es sintética o cuando una métrica es demasiado buena para
                ser cierta, prefiero decirlo que esconderlo detrás de una gráfica bonita.
              </p>
            </div>
          </div>

          {/* Recorrido */}
          <div className="relative">
            <div className="absolute top-2 bottom-2 left-[7px] w-px bg-linear-to-b from-sky-accent/60 via-line to-transparent" />
            <ul className="space-y-8">
              {RECORRIDO.map((paso, i) => (
                <li key={paso.fase} className="relative pl-8">
                  <span className="absolute top-1.5 left-0 flex h-4 w-4 items-center justify-center rounded-full border border-line bg-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-accent" />
                  </span>
                  <p className="font-mono text-xs text-mist">0{i + 1}</p>
                  <h3 className="mt-1 text-base font-medium text-white">{paso.fase}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mist">{paso.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
