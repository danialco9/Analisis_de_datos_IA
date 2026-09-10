import { lazy, Suspense, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import DemoLesiones from './DemoLesiones'

// SQLite compilado a WASM pesa lo suyo: solo se descarga si el visitante
// abre esa pestaña.
const DemoSQL = lazy(() => import('./DemoSQL'))

// El chat del Chef AI (`DemoChef.jsx` + `api/chef.js`) esta implementado y
// desplegado, pero desactivado a proposito: requiere una GEMINI_API_KEY viva
// y una cuota que un visitante podria agotar. Para reactivarlo basta con
// configurar la variable en Vercel y devolver su entrada a este array.
// const DemoChef = lazy(() => import('./DemoChef'))

const DEMOS = [
  {
    id: 'lesiones',
    etiqueta: 'Predicción de lesiones',
    titulo: 'El modelo del TFM, corriendo aquí',
    descripcion:
      'Este no es un vídeo ni una simulación: es el XGBoost entrenado en el Trabajo Fin de Máster, exportado a JSON y ejecutándose en tu navegador. Mueve los controles y el riesgo se recalcula al instante, con la misma lógica que la aplicación Streamlit original.',
  },
  {
    id: 'sql',
    etiqueta: 'Consultas SQL',
    titulo: 'Su base de datos, en tu navegador',
    descripcion:
      'SQLite compilado a WebAssembly, montando el esquema en estrella y los datos reales del proyecto. Puedes lanzar las consultas de ejemplo o escribir la tuya: se ejecuta de verdad contra la base.',
  },
]

export default function Demos() {
  const [activa, setActiva] = useState('lesiones')
  const ref = useReveal()
  const demo = DEMOS.find((d) => d.id === activa)

  return (
    <section id="demos" className="border-t border-line px-5 py-24 sm:py-32">
      <div ref={ref} className="revelar mx-auto max-w-6xl">
        <p className="font-mono text-xs tracking-widest text-sky-accent uppercase">
          04 — Demos en vivo
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-4xl">
          Pruébalo tú mismo
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist">
          Leer que un proyecto funciona no es lo mismo que comprobarlo. Estas dos demos
          ejecutan el código real, sin servidor detrás: el modelo y la base de datos corren
          enteros en tu navegador.
        </p>

        {/* Selector */}
        <div
          role="tablist"
          aria-label="Demostraciones interactivas"
          className="mt-10 flex flex-wrap gap-2"
        >
          {DEMOS.map((d) => (
            <button
              key={d.id}
              role="tab"
              aria-selected={activa === d.id}
              onClick={() => setActiva(d.id)}
              className={`rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                activa === d.id
                  ? 'border-sky-accent/40 bg-sky-accent/10 text-white'
                  : 'border-line text-mist hover:border-sky-accent/30 hover:text-white'
              }`}
            >
              {d.etiqueta}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-white">{demo.titulo}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist">
            {demo.descripcion}
          </p>
        </div>

        <div className="mt-8">
          {activa === 'lesiones' && <DemoLesiones />}

          {activa === 'sql' && (
            <Suspense
              fallback={
                <div className="tarjeta flex items-center justify-center p-16 text-sm text-mist">
                  Cargando SQLite...
                </div>
              }
            >
              <DemoSQL />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  )
}
