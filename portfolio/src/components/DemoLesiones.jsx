import { useMemo, useState } from 'react'
import {
  predecir,
  ENTRADA_INICIAL,
  PERFILES,
  DEPORTES,
  META_MODELO,
} from '../lib/modeloLesiones'

/** Slider con etiqueta y valor, controlado. */
function Control({ label, campo, min, max, step = 1, sufijo = '', valor, onChange }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2 text-xs text-mist">
        {label}
        <span className="font-mono text-sm text-white">
          {valor}
          {sufijo}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valor}
        onChange={(e) => onChange(campo, Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-sky-accent"
      />
    </label>
  )
}

/** Indicador circular del score. */
function Medidor({ score, color }) {
  const R = 68
  const circunferencia = Math.PI * R // media circunferencia
  const avance = (score / 100) * circunferencia

  return (
    <div className="relative">
      <svg viewBox="0 0 160 92" className="w-full max-w-[240px]" role="img"
        aria-label={`Score de riesgo: ${score} sobre 100`}>
        <path
          d="M 12 80 A 68 68 0 0 1 148 80"
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 12 80 A 68 68 0 0 1 148 80"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${avance} ${circunferencia}`}
          style={{ transition: 'stroke-dasharray 0.5s cubic-bezier(0.16,1,0.3,1), stroke 0.4s' }}
        />
        <text
          x="80"
          y="70"
          textAnchor="middle"
          className="font-mono"
          style={{ fill: color, fontSize: '34px', fontWeight: 600 }}
        >
          {score}
        </text>
      </svg>
    </div>
  )
}

export default function DemoLesiones() {
  const [entrada, setEntrada] = useState(ENTRADA_INICIAL)
  const [avanzado, setAvanzado] = useState(false)

  const actualizar = (campo, valor) => setEntrada((prev) => ({ ...prev, [campo]: valor }))

  const cargarPerfil = (clave) =>
    setEntrada((prev) => ({ ...prev, ...PERFILES[clave].valores }))

  // La inferencia es lo bastante rapida como para recalcular en cada cambio.
  const resultado = useMemo(() => predecir(entrada), [entrada])

  const posiciones = DEPORTES[entrada.Deporte] ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ── Controles ── */}
      <div className="tarjeta p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(PERFILES).map(([clave, p]) => (
            <button
              key={clave}
              type="button"
              onClick={() => cargarPerfil(clave)}
              className="rounded-full border border-line px-3.5 py-1.5 text-xs text-mist transition-colors hover:border-sky-accent/40 hover:text-white"
            >
              {p.etiqueta}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEntrada(ENTRADA_INICIAL)}
            className="rounded-full border border-line px-3.5 py-1.5 text-xs text-mist transition-colors hover:border-sky-accent/40 hover:text-white"
          >
            Reiniciar
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Control label="Intensidad de entrenamiento" campo="Training_Intensity" min={1} max={10}
            sufijo="/10" valor={entrada.Training_Intensity} onChange={actualizar} />
          <Control label="Horas de entrenamiento/semana" campo="Training_Hours_Per_Week" min={1}
            max={30} sufijo="h" valor={entrada.Training_Hours_Per_Week} onChange={actualizar} />
          <Control label="Días de descanso/semana" campo="Recovery_Days_Per_Week" min={0} max={6}
            valor={entrada.Recovery_Days_Per_Week} onChange={actualizar} />
          <Control label="Fatiga percibida" campo="Fatigue_Score" min={1} max={10} sufijo="/10"
            valor={entrada.Fatigue_Score} onChange={actualizar} />
          <Control label="Horas de sueño" campo="sleep_hours" min={4} max={10} step={0.5}
            sufijo="h" valor={entrada.sleep_hours} onChange={actualizar} />
          <Control label="Hidratación" campo="hydration_liters" min={1} max={4} step={0.5}
            sufijo="L" valor={entrada.hydration_liters} onChange={actualizar} />
          <Control label="Eventos o partidos/semana" campo="Match_Count_Per_Week" min={0} max={7}
            valor={entrada.Match_Count_Per_Week} onChange={actualizar} />
          <Control label="Días entre eventos" campo="Rest_Between_Events_Days" min={0} max={7}
            valor={entrada.Rest_Between_Events_Days} onChange={actualizar} />
          <Control label="Equilibrio de carga" campo="Load_Balance_Score" min={1} max={100}
            sufijo="/100" valor={entrada.Load_Balance_Score} onChange={actualizar} />
          <Control label="Score ACL" campo="ACL_Risk_Score" min={1} max={100} sufijo="/100"
            valor={entrada.ACL_Risk_Score} onChange={actualizar} />
          <Control label="Comidas al día" campo="meals_per_day" min={2} max={6}
            valor={entrada.meals_per_day} onChange={actualizar} />
          <Control label="Calidad del sueño" campo="sleep_quality" min={1} max={10} step={0.5}
            sufijo="/10" valor={entrada.sleep_quality} onChange={actualizar} />
        </div>

        <button
          type="button"
          onClick={() => setAvanzado((v) => !v)}
          aria-expanded={avanzado}
          className="mt-6 text-xs text-sky-accent underline underline-offset-4 hover:text-white"
        >
          {avanzado ? 'Ocultar' : 'Mostrar'} perfil del atleta
        </button>

        {avanzado && (
          <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
            <Control label="Edad" campo="Age" min={16} max={55} sufijo=" años"
              valor={entrada.Age} onChange={actualizar} />
            <Control label="Altura" campo="Height_cm" min={150} max={220} sufijo=" cm"
              valor={entrada.Height_cm} onChange={actualizar} />
            <Control label="Peso" campo="Weight_kg" min={45} max={140} sufijo=" kg"
              valor={entrada.Weight_kg} onChange={actualizar} />
            <Control label="Rendimiento percibido" campo="Performance_Score" min={1} max={100}
              sufijo="/100" valor={entrada.Performance_Score} onChange={actualizar} />

            <label className="block">
              <span className="text-xs text-mist">Género</span>
              <select
                value={entrada.Gender}
                onChange={(e) => actualizar('Gender', e.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white focus:border-sky-accent/50 focus:outline-none"
              >
                <option value="Male">Masculino</option>
                <option value="Female">Femenino</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-mist">Deporte</span>
              <select
                value={entrada.Deporte}
                onChange={(e) =>
                  setEntrada((prev) => ({
                    ...prev,
                    Deporte: e.target.value,
                    Position: DEPORTES[e.target.value][0],
                  }))
                }
                className="mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white focus:border-sky-accent/50 focus:outline-none"
              >
                {Object.keys(DEPORTES).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            {posiciones.length > 1 && (
              <label className="block">
                <span className="text-xs text-mist">Posición</span>
                <select
                  value={entrada.Position}
                  onChange={(e) => actualizar('Position', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-white focus:border-sky-accent/50 focus:outline-none"
                >
                  {posiciones.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      <div className="tarjeta flex flex-col items-center p-6">
        <Medidor score={resultado.score} color={resultado.color} />

        <p
          className="mt-1 font-mono text-sm tracking-widest"
          style={{ color: resultado.color }}
        >
          RIESGO {resultado.nivel}
        </p>
        <p className="mt-3 font-mono text-xs text-mist">
          Probabilidad del modelo: {(resultado.probabilidad * 100).toFixed(1)}%
        </p>

        <div className="mt-6 w-full border-t border-line pt-5">
          <h4 className="text-xs font-medium text-white">Factores principales</h4>
          <ul className="mt-3 space-y-2.5">
            {resultado.factores.map(([titulo, detalle]) => (
              <li key={titulo}>
                <p className="text-sm text-white">{titulo}</p>
                <p className="text-xs text-mist">{detalle}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 w-full border-t border-line pt-5">
          <h4 className="text-xs font-medium text-white">Recomendaciones</h4>
          <ul className="mt-3 space-y-2.5">
            {resultado.recomendaciones.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-mist">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-accent" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 border-t border-line pt-4 text-[0.68rem] leading-relaxed text-mist/80">
          {META_MODELO.modelo} real del TFM ({META_MODELO.nArboles} árboles,{' '}
          {META_MODELO.nFeatures} variables) ejecutándose en tu navegador. No sustituye una
          valoración médica.
        </p>
      </div>
    </div>
  )
}
