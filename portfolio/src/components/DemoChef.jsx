import { useEffect, useRef, useState } from 'react'

const SUGERENCIAS = [
  '¿Qué lleva una paella valenciana auténtica?',
  '¿Cómo se templa el chocolate y por qué?',
  '¿Con qué vino marido un pescado azul?',
  '¿Qué es la esferificación?',
]

export default function DemoChef() {
  const [mensajes, setMensajes] = useState([])
  const [entrada, setEntrada] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [mensajes, cargando])

  async function preguntar(texto) {
    const pregunta = texto.trim()
    if (!pregunta || cargando) return

    setEntrada('')
    setError(null)
    setCargando(true)

    const historial = mensajes.map((m) => ({ rol: m.rol, texto: m.texto }))
    setMensajes((prev) => [...prev, { rol: 'usuario', texto: pregunta }])

    try {
      const r = await fetch('/api/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta, historial }),
      })

      // En `npm run dev` la funcion serverless no existe: Vite devuelve el
      // index.html y el JSON falla al parsearse. Se detecta y se explica.
      const tipo = r.headers.get('content-type') ?? ''
      if (!tipo.includes('application/json')) {
        throw new Error(
          'La función del servidor no está disponible aquí. Esta demo necesita el despliegue en Vercel (o `vercel dev` en local).',
        )
      }

      const datos = await r.json()
      if (!r.ok) throw new Error(datos.error ?? 'Error desconocido.')

      setMensajes((prev) => [
        ...prev,
        { rol: 'chef', texto: datos.respuesta, fuentes: datos.fuentes },
      ])
    } catch (e) {
      setError(e.message)
      // Se retira la pregunta que no llego a responderse.
      setMensajes((prev) => prev.slice(0, -1))
      setEntrada(pregunta)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="tarjeta flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg" aria-hidden="true">
            🍳
          </span>
          <div>
            <p className="text-sm text-white">Chef AI</p>
            <p className="font-mono text-[0.68rem] text-mist">
              gemini-2.5-flash-lite · RAG sobre 6 documentos
            </p>
          </div>
        </div>
        {mensajes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMensajes([])
              setError(null)
            }}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-mist transition-colors hover:border-sky-accent/40 hover:text-white"
          >
            Reiniciar
          </button>
        )}
      </div>

      {/* Conversacion */}
      <div className="h-96 space-y-4 overflow-y-auto p-5">
        {mensajes.length === 0 && !cargando && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="max-w-sm text-sm leading-relaxed text-mist">
              Pregúntale sobre cocina española o japonesa, técnicas francesas, chocolate,
              maridaje de vinos o cocina molecular.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => preguntar(s)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs text-mist transition-colors hover:border-sky-accent/40 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={m.rol === 'usuario' ? 'flex justify-end' : ''}>
            <div className={m.rol === 'usuario' ? 'max-w-[85%]' : 'w-full'}>
              <div
                className={
                  m.rol === 'usuario'
                    ? 'rounded-2xl rounded-br-sm bg-sky-accent/12 px-4 py-2.5 text-sm text-white'
                    : 'text-sm leading-relaxed whitespace-pre-wrap text-mist'
                }
              >
                {m.texto}
              </div>

              {/* Documentos que uso el RAG para responder */}
              {m.fuentes?.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.66rem] text-mist/70">
                    contexto recuperado:
                  </span>
                  {m.fuentes.map((f) => (
                    <span key={f.tema} className="etiqueta">
                      {f.tema} · {f.score}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {cargando && (
          <p className="font-mono text-xs text-mist">
            <span className="cursor-parpadeo">▍</span> recuperando contexto y consultando a
            Gemini...
          </p>
        )}

        <div ref={finRef} />
      </div>

      {error && (
        <p className="border-t border-line bg-red-500/5 px-5 py-3 text-xs leading-relaxed text-red-400">
          {error}
        </p>
      )}

      {/* Entrada */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          preguntar(entrada)
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          placeholder="Pregunta algo de cocina..."
          maxLength={500}
          aria-label="Tu pregunta para el Chef AI"
          className="flex-1 rounded-xl border border-line bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-mist/70 focus:border-sky-accent/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={cargando || !entrada.trim()}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
