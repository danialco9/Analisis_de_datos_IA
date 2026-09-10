import { useReveal } from '../hooks/useReveal'

const CONTACTO = [
  {
    etiqueta: 'Email',
    valor: 'danielalco999@gmail.com',
    href: 'mailto:danielalco999@gmail.com',
  },
  {
    etiqueta: 'Teléfono',
    valor: '644 56 04 35',
    href: 'tel:+34644560435',
  },
  {
    etiqueta: 'LinkedIn',
    valor: 'daniel-alconada-díaz',
    // La í va percent-encodeada (%C3%AD) para que el enlace funcione igual en
    // cualquier navegador y al copiarlo y pegarlo.
    href: 'https://www.linkedin.com/in/daniel-alconada-d%C3%ADaz',
  },
  {
    etiqueta: 'GitHub',
    valor: '@danialco9',
    href: 'https://github.com/danialco9',
  },
]

export default function Contact() {
  const ref = useReveal()

  return (
    <section id="contacto" className="border-t border-line px-5 py-24 sm:py-32">
      <div ref={ref} className="revelar mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-sky-accent uppercase">
          06 — Contacto
        </p>

        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
          Si te encaja lo que hago,
          <br />
          <span className="texto-degradado">hablemos</span>
        </h2>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-mist">
          Estoy abierto a oportunidades en análisis de datos, machine learning e IA aplicada.
          La forma más rápida de ver cómo trabajo es el código: está todo público.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTO.map((c) => {
            const esExterno = c.href.startsWith('http')
            return (
              <a
                key={c.etiqueta}
                href={c.href}
                target={esExterno ? '_blank' : undefined}
                rel={esExterno ? 'noreferrer' : undefined}
                className="tarjeta group flex items-center justify-between gap-3 p-6 transition-all hover:-translate-y-1 hover:border-sky-accent/40"
              >
                <div className="min-w-0">
                  <p className="text-xs text-mist">{c.etiqueta}</p>
                  <p className="mt-1 truncate text-sm text-white">{c.valor}</p>
                </div>
                <span className="shrink-0 text-mist transition-all group-hover:translate-x-1 group-hover:text-sky-accent">
                  →
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
