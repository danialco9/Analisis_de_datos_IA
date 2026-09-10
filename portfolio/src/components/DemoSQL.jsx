import { useCallback, useEffect, useRef, useState } from 'react'
import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

// Los scripts reales del proyecto, cargados como texto por Vite.
import esquemaSQL from '../data/sql/01_schema.sql?raw'
import datosSQL from '../data/sql/02_data.sql?raw'

const CONSULTAS = [
  {
    nombre: 'Peor descanso por deporte',
    nota: 'Agregación con JOIN sobre la tabla de hechos.',
    sql: `SELECT
    d.nombre_deporte,
    ROUND(AVG(f.sleep_hours), 2) AS avg_sueno,
    COUNT(*) AS registros
FROM fact_habitos_diarios f
INNER JOIN dim_deporte d
        ON f.sport_id = d.sport_id
GROUP BY d.nombre_deporte
ORDER BY avg_sueno ASC;`,
  },
  {
    nombre: 'Intensidad vs. descanso',
    nota: 'CASE para clasificar el resultado dentro de la propia consulta.',
    sql: `SELECT
    n.descripcion AS nivel_entrenamiento,
    ROUND(AVG(f.training_minutes), 1) AS avg_minutos,
    ROUND(AVG(f.sleep_hours), 2) AS avg_sueno,
    CASE
        WHEN AVG(f.sleep_hours) < 6.5 THEN 'DESCANSO DEFICIENTE'
        ELSE 'DESCANSO ADECUADO'
    END AS calidad_descanso
FROM fact_habitos_diarios f
INNER JOIN dim_nivel_entrenamiento n
        ON f.level_id = n.level_id
GROUP BY n.descripcion;`,
  },
  {
    nombre: 'Usuarios en riesgo',
    nota: 'Dos CTEs encadenadas para detectar sobreentrenamiento.',
    sql: `WITH resumen_usuario AS (
    SELECT
        user_id,
        AVG(training_minutes) AS avg_minutos,
        AVG(sleep_hours) AS avg_sueno
    FROM fact_habitos_diarios
    GROUP BY user_id
),
usuarios_riesgo AS (
    SELECT
        user_id,
        ROUND(avg_minutos, 1) AS avg_minutos,
        ROUND(avg_sueno, 2) AS avg_sueno,
        CASE
            WHEN avg_minutos > 100 AND avg_sueno < 6.5
                 THEN 'USUARIO RIESGO'
            ELSE 'USUARIO NORMAL'
        END AS clasificacion
    FROM resumen_usuario
)
SELECT *
FROM usuarios_riesgo
WHERE clasificacion = 'USUARIO RIESGO';`,
  },
  {
    nombre: 'Media móvil por usuario',
    nota: 'Window function: compara cada día con la media del propio usuario.',
    sql: `SELECT
    user_id,
    training_minutes,
    ROUND(
        AVG(training_minutes) OVER (PARTITION BY user_id),
        1
    ) AS avg_entrenamiento_usuario
FROM fact_habitos_diarios
ORDER BY user_id
LIMIT 25;`,
  },
  {
    nombre: 'Ingresos por mes',
    nota: 'JOIN con rango de fechas contra la dimensión calendario.',
    sql: `SELECT
    c.mes,
    c.anio,
    SUM(s.precio_mensual) AS ingresos_estimados
FROM fact_suscripciones fs
JOIN dim_suscripcion s ON fs.subscription_id = s.subscription_id
JOIN dim_calendario c
     ON c.fecha BETWEEN fs.fecha_inicio AND IFNULL(fs.fecha_fin, CURRENT_DATE)
WHERE fs.activa = 1
GROUP BY c.mes, c.anio
ORDER BY c.anio, c.mes;`,
  },
]

export default function DemoSQL() {
  const dbRef = useRef(null)
  const [estado, setEstado] = useState('cargando')
  const [error, setError] = useState(null)
  const [sql, setSql] = useState(CONSULTAS[0].sql)
  const [activa, setActiva] = useState(0)
  const [resultado, setResultado] = useState(null)

  const ejecutar = useCallback((consulta) => {
    const db = dbRef.current
    if (!db) return
    try {
      const salida = db.exec(consulta)
      setResultado(salida.length ? salida[salida.length - 1] : { columns: [], values: [] })
      setError(null)
    } catch (e) {
      setError(e.message)
      setResultado(null)
    }
  }, [])

  // Monta la base en memoria una sola vez, con el esquema y los datos reales.
  useEffect(() => {
    let cancelado = false

    initSqlJs({ locateFile: () => wasmUrl })
      .then((SQL) => {
        if (cancelado) return
        const db = new SQL.Database()
        db.run(esquemaSQL)
        db.run(datosSQL)
        dbRef.current = db
        setEstado('listo')

        const salida = db.exec(CONSULTAS[0].sql)
        setResultado(salida.length ? salida[salida.length - 1] : null)
      })
      .catch((e) => {
        if (!cancelado) {
          setEstado('error')
          setError(e.message)
        }
      })

    return () => {
      cancelado = true
      dbRef.current?.close()
      dbRef.current = null
    }
  }, [])

  const elegir = (i) => {
    setActiva(i)
    setSql(CONSULTAS[i].sql)
    ejecutar(CONSULTAS[i].sql)
  }

  if (estado === 'cargando') {
    return (
      <div className="tarjeta flex items-center justify-center p-16 text-sm text-mist">
        Montando la base de datos en tu navegador...
      </div>
    )
  }

  if (estado === 'error') {
    return (
      <div className="tarjeta p-8 text-sm text-red-400">
        No se pudo iniciar SQLite: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Consultas de ejemplo */}
      <div className="flex flex-wrap gap-2">
        {CONSULTAS.map((c, i) => (
          <button
            key={c.nombre}
            type="button"
            onClick={() => elegir(i)}
            className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              activa === i
                ? 'border-sky-accent/40 bg-sky-accent/10 text-white'
                : 'border-line text-mist hover:border-sky-accent/30 hover:text-white'
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <p className="text-xs text-mist">{CONSULTAS[activa].nota}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className="tarjeta flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-xs text-mist">consulta.sql</span>
            <button
              type="button"
              onClick={() => ejecutar(sql)}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-ink transition-transform hover:-translate-y-0.5"
            >
              Ejecutar ▸
            </button>
          </div>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck="false"
            aria-label="Editor de consultas SQL"
            className="h-72 w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-white focus:outline-none"
          />
        </div>

        {/* Resultados */}
        <div className="tarjeta flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-xs text-mist">resultado</span>
            {resultado && (
              <span className="font-mono text-xs text-mist">
                {resultado.values.length} fila{resultado.values.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="h-72 overflow-auto">
            {error ? (
              <p className="p-4 font-mono text-xs leading-relaxed text-red-400">{error}</p>
            ) : resultado && resultado.values.length ? (
              <table className="w-full text-left font-mono text-xs">
                <thead className="sticky top-0 border-b border-line bg-ink-soft">
                  <tr>
                    {resultado.columns.map((c) => (
                      <th key={c} className="px-3 py-2 font-medium whitespace-nowrap text-white">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.values.map((fila, i) => (
                    <tr key={i} className="border-b border-line/40">
                      {fila.map((celda, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap text-mist">
                          {celda === null ? (
                            <span className="opacity-40">NULL</span>
                          ) : (
                            String(celda)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-xs text-mist">Sin resultados.</p>
            )}
          </div>
        </div>
      </div>

      <p className="text-[0.68rem] leading-relaxed text-mist/80">
        SQLite compilado a WebAssembly, con el esquema y los datos reales del proyecto
        (<span className="font-mono">01_schema.sql</span> y{' '}
        <span className="font-mono">02_data.sql</span>). Puedes editar la consulta y ejecutar
        lo que quieras: la base vive solo en tu navegador.
      </p>
    </div>
  )
}
