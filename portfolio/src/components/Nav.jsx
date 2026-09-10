import { useEffect, useState } from 'react'
import { useSeccionActiva, useProgresoScroll } from '../hooks/useReveal'

const ENLACES = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'demos', label: 'Demos' },
  { id: 'skills', label: 'Skills' },
  { id: 'contacto', label: 'Contacto' },
]

const IDS = ENLACES.map((e) => e.id)

export default function Nav() {
  const [abierto, setAbierto] = useState(false)
  const [conFondo, setConFondo] = useState(false)
  const activa = useSeccionActiva(IDS)
  const progreso = useProgresoScroll()

  useEffect(() => {
    const alScroll = () => setConFondo(window.scrollY > 20)
    window.addEventListener('scroll', alScroll, { passive: true })
    alScroll()
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  // Bloquea el scroll del fondo mientras el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        conFondo ? 'border-b border-line bg-ink/85 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      {/* Barra de progreso de lectura */}
      <div
        className="absolute inset-x-0 top-0 h-px origin-left bg-linear-to-r from-sky-accent to-violet-accent"
        style={{ transform: `scaleX(${progreso})` }}
        aria-hidden="true"
      />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a
          href="#inicio"
          className="text-sm font-medium tracking-tight text-white transition-opacity hover:opacity-70"
        >
          Daniel Alconada Díaz
        </a>

        {/* Navegacion de escritorio */}
        <ul className="hidden items-center gap-1 md:flex">
          {ENLACES.map((enlace) => (
            <li key={enlace.id}>
              <a
                href={`#${enlace.id}`}
                aria-current={activa === enlace.id ? 'true' : undefined}
                className={`relative rounded-lg px-3 py-2 text-sm transition-colors ${
                  activa === enlace.id
                    ? 'text-white'
                    : 'text-mist hover:text-white'
                }`}
              >
                {enlace.label}
                {activa === enlace.id && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-linear-to-r from-sky-accent to-violet-accent" />
                )}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://github.com/danialco9"
              target="_blank"
              rel="noreferrer"
              className="ml-2 rounded-lg border border-line px-3 py-2 text-sm text-mist transition-colors hover:border-sky-accent/50 hover:text-white"
            >
              GitHub
            </a>
          </li>
        </ul>

        {/* Botón de menú móvil */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-line md:hidden"
        >
          <span
            className={`h-px w-4 bg-white transition-transform duration-300 ${
              abierto ? 'translate-y-[3px] rotate-45' : ''
            }`}
          />
          <span
            className={`h-px w-4 bg-white transition-transform duration-300 ${
              abierto ? '-translate-y-[3px] -rotate-45' : ''
            }`}
          />
        </button>
      </nav>

      {/* Panel movil */}
      {abierto && (
        <div className="border-t border-line bg-ink/95 backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {ENLACES.map((enlace) => (
              <li key={enlace.id}>
                <a
                  href={`#${enlace.id}`}
                  onClick={() => setAbierto(false)}
                  className={`block border-b border-line/60 py-3 text-sm ${
                    activa === enlace.id ? 'text-sky-accent' : 'text-mist'
                  }`}
                >
                  {enlace.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/danialco9"
                target="_blank"
                rel="noreferrer"
                className="block py-3 text-sm text-mist"
              >
                GitHub ↗
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
