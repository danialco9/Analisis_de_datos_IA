/**
 * Funcion serverless del Chef AI.
 *
 * Reproduce el grafo de LangGraph del notebook en dos pasos:
 *   1. recuperar : embebe la pregunta y saca los 3 documentos mas cercanos
 *   2. generar   : inyecta ese contexto en el system prompt junto al
 *                  historial y llama a Gemini
 *
 * La GEMINI_API_KEY vive aqui, en el servidor, y nunca se envia al navegador.
 */

import { readFileSync } from 'node:fs'

const { documentos } = JSON.parse(
  readFileSync(new URL('./corpus.json', import.meta.url), 'utf-8'),
)

const MODELO_CHAT = 'gemini-2.5-flash-lite'
const MODELO_EMBEDDING = 'models/gemini-embedding-001'
const BASE = 'https://generativelanguage.googleapis.com/v1beta'

// El mismo system prompt del notebook, con {context} como marcador.
const SYSTEM_PROMPT = `Eres Chef AI, un asistente experto en gastronomía con profundo conocimiento
en cocina internacional, técnicas culinarias, ingredientes, maridajes y cultura gastronómica.

Tu forma de responder:
- Usa un tono profesional pero accesible, como un chef experimentado hablando con un alumno.
- Sé preciso y útil. Cuando des recetas o técnicas, sé específico con cantidades y pasos.
- Si el contexto proporcionado contiene la respuesta, úsalo como base principal.
- Si no tienes información suficiente sobre algo, dilo claramente: no inventes.
- Puedes añadir curiosidades o consejos relacionados cuando sea relevante.

Tu especialidad:
- Cocinas del mundo (española, japonesa, francesa, italiana, etc.)
- Técnicas culinarias (básicas y de vanguardia)
- Repostería y chocolatería
- Maridaje de vinos y bebidas
- Historia y cultura de los alimentos

Límites:
- Solo respondes sobre gastronomía y temas relacionados con la alimentación.
- Si te preguntan algo fuera de tu área, redirige amablemente hacia temas gastronómicos.

Contexto recuperado de la base de conocimiento:
{context}
`

// ── Limites de uso ────────────────────────────────────────────
// La cuota gratuita de Gemini es de 15 peticiones/minuto y 1000/dia, y cada
// pregunta consume dos (embedding + chat). Sin base de datos el control solo
// puede ser aproximado: cada instancia de la funcion tiene su propia memoria
// y Vercel puede levantar varias. Frena el abuso casual, no un ataque serio.
const MAX_PREGUNTA = 500
const MAX_HISTORIAL = 8
const VENTANA_MS = 10 * 60 * 1000
const MAX_POR_IP = 10
const MAX_DIARIO = 300

const porIP = new Map()
let contadorDiario = { dia: new Date().toDateString(), n: 0 }

function limiteAlcanzado(ip) {
  const ahora = Date.now()

  const hoy = new Date().toDateString()
  if (contadorDiario.dia !== hoy) contadorDiario = { dia: hoy, n: 0 }
  if (contadorDiario.n >= MAX_DIARIO) return 'diario'

  const previas = (porIP.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS)
  if (previas.length >= MAX_POR_IP) {
    porIP.set(ip, previas)
    return 'ip'
  }

  previas.push(ahora)
  porIP.set(ip, previas)
  contadorDiario.n++

  // Limpieza para que el Map no crezca sin control en instancias longevas.
  if (porIP.size > 500) {
    for (const [clave, marcas] of porIP) {
      if (!marcas.some((t) => ahora - t < VENTANA_MS)) porIP.delete(clave)
    }
  }

  return null
}

// ── Recuperacion ──────────────────────────────────────────────
function similitudCoseno(a, b) {
  let producto = 0
  for (let i = 0; i < a.length; i++) producto += a[i] * b[i]
  return producto // los vectores de Gemini ya vienen normalizados
}

async function embeber(texto, apiKey) {
  const r = await fetch(`${BASE}/${MODELO_EMBEDDING}:embedContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELO_EMBEDDING,
      content: { parts: [{ text: texto }] },
    }),
  })
  if (!r.ok) throw new Error(`Embedding: ${r.status} ${(await r.text()).slice(0, 200)}`)
  const datos = await r.json()
  return datos.embedding.values
}

function recuperar(vectorPregunta, k = 3) {
  return documentos
    .map((d) => ({ ...d, score: similitudCoseno(vectorPregunta, d.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

// ── Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se admite POST.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'El servidor no tiene configurada GEMINI_API_KEY.',
    })
  }

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'desconocida'

  const motivo = limiteAlcanzado(ip)
  if (motivo === 'diario') {
    return res.status(429).json({
      error:
        'La demo ha alcanzado su límite diario de consultas. Vuelve mañana o mira el código en GitHub.',
    })
  }
  if (motivo === 'ip') {
    return res.status(429).json({
      error: 'Has hecho muchas preguntas seguidas. Espera unos minutos y vuelve a intentarlo.',
    })
  }

  try {
    const { pregunta, historial = [] } = req.body ?? {}

    if (typeof pregunta !== 'string' || !pregunta.trim()) {
      return res.status(400).json({ error: 'Falta la pregunta.' })
    }
    if (pregunta.length > MAX_PREGUNTA) {
      return res.status(400).json({
        error: `La pregunta no puede pasar de ${MAX_PREGUNTA} caracteres.`,
      })
    }

    // Nodo 1: recuperar
    const vector = await embeber(pregunta, apiKey)
    const recuperados = recuperar(vector)
    const contexto = recuperados.map((d) => d.texto).join('\n\n---\n\n')

    // Nodo 2: generar
    const mensajes = historial
      .slice(-MAX_HISTORIAL)
      .filter((m) => m && typeof m.texto === 'string')
      .map((m) => ({
        role: m.rol === 'usuario' ? 'user' : 'model',
        parts: [{ text: m.texto.slice(0, 2000) }],
      }))

    mensajes.push({ role: 'user', parts: [{ text: pregunta }] })

    const r = await fetch(`${BASE}/models/${MODELO_CHAT}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT.replace('{context}', contexto) }],
        },
        contents: mensajes,
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      }),
    })

    if (!r.ok) {
      const detalle = await r.text()
      if (r.status === 429) {
        return res.status(429).json({
          error: 'La cuota de Gemini está agotada ahora mismo. Inténtalo más tarde.',
        })
      }
      throw new Error(`Gemini: ${r.status} ${detalle.slice(0, 200)}`)
    }

    const datos = await r.json()
    const respuesta = datos.candidates?.[0]?.content?.parts
      ?.map((p) => p.text)
      .filter(Boolean)
      .join('')

    if (!respuesta) {
      return res.status(502).json({ error: 'Gemini no devolvió texto.' })
    }

    return res.status(200).json({
      respuesta,
      // Devolver que documentos se usaron hace visible el RAG.
      fuentes: recuperados.map((d) => ({
        tema: d.meta.tema ?? 'desconocido',
        fuente: d.meta.fuente ?? '',
        score: Number(d.score.toFixed(3)),
      })),
    })
  } catch (e) {
    console.error('[chef]', e)
    return res.status(500).json({ error: 'Error al consultar el asistente.' })
  }
}
