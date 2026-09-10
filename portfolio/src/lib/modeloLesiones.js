/**
 * Motor de inferencia del modelo de riesgo de lesion, en el navegador.
 *
 * `modelo_lesiones.json` es un volcado del XGBoost real entrenado en el TFM
 * (100 arboles, 23 features) junto con la media y escala del StandardScaler.
 * El script de exportacion verifico que evaluar los arboles asi reproduce
 * `predict_proba` del modelo original con una diferencia maxima de 1.3e-07.
 *
 * El resto del archivo es un port directo de `proyecto final/app/app.py`:
 * misma construccion de features, mismos pesos de score y mismos umbrales.
 */

import modeloJSON from '../data/modelo_lesiones.json'

const { featureNames, baseScore, trees, scaler } = modeloJSON

export const META_MODELO = modeloJSON.meta

// Mapeo de la posicion elegida en la interfaz a la que conoce el modelo.
// Ojo: el modelo solo se entreno con Center, Forward y Guard. Las posiciones
// que mapean a Defender o Midfielder no tienen columna, asi que quedan a cero.
// Es el mismo comportamiento que la app de Streamlit.
export const DEPORTES = {
  Baloncesto: ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'],
  Fútbol: ['Portero', 'Defensa Central', 'Lateral', 'Centrocampista', 'Extremo', 'Delantero'],
  Vóley: ['Colocador/a', 'Receptor/a', 'Central', 'Opuesto/a', 'Líbero'],
  Atletismo: ['Velocista', 'Fondista', 'Saltador/a', 'Lanzador/a'],
  Tenis: ['Tenista'],
  Natación: ['Nadador/a'],
  'Gym / Musculación': ['Solo musculación (sin deporte)'],
}

const POSICION_MODELO = {
  Base: 'Guard',
  Escolta: 'Guard',
  Alero: 'Forward',
  'Ala-Pívot': 'Forward',
  Pívot: 'Center',
  Portero: 'Center',
  'Defensa Central': 'Defender',
  Lateral: 'Defender',
  Centrocampista: 'Midfielder',
  Extremo: 'Forward',
  Delantero: 'Forward',
  'Colocador/a': 'Guard',
  'Receptor/a': 'Forward',
  Central: 'Center',
  'Opuesto/a': 'Forward',
  'Líbero': 'Defender',
  Velocista: 'Guard',
  Fondista: 'Midfielder',
  'Saltador/a': 'Forward',
  'Lanzador/a': 'Center',
  'Nadador/a': 'Guard',
  Tenista: 'Guard',
  'Solo musculación (sin deporte)': null,
}

/**
 * Recorre un arbol de decision hasta la hoja.
 *
 * XGBoost guarda los umbrales en float32 y compara en float32. JavaScript
 * calcula en float64, asi que hay que redondear con Math.fround en ambos
 * lados: si no, un valor que cae justo sobre el umbral se va por la rama
 * contraria y la prediccion se desvia. Con entradas discretas (enteros y
 * medios puntos) esos empates son frecuentes, no una rareza.
 */
function evaluarArbol(nodo, fila) {
  while (nodo.leaf === undefined) {
    const idx = featureNames.indexOf(nodo.split)
    const valor = fila[idx]
    const siguienteId =
      valor === null || Number.isNaN(valor)
        ? nodo.missing
        : valor < Math.fround(nodo.split_condition)
          ? nodo.yes
          : nodo.no
    nodo = nodo.children.find((h) => h.nodeid === siguienteId)
  }
  return nodo.leaf
}

/** Probabilidad de lesion segun el XGBoost, sobre el vector ya escalado. */
function predecirProbabilidad(filaEscalada) {
  let logit = Math.log(baseScore / (1 - baseScore))
  for (const arbol of trees) logit += evaluarArbol(arbol, filaEscalada)
  return 1 / (1 + Math.exp(-logit))
}

/** Construye el vector de 23 features y le aplica el StandardScaler. */
function construirFeatures(datos) {
  const fila = featureNames.map((col) => {
    if (col in datos) return Number(datos[col])
    if (col === `Gender_${datos.Gender}`) return 1
    const posModelo = POSICION_MODELO[datos.Position]
    if (posModelo && col === `Position_${posModelo}`) return 1
    return 0
  })
  // El escalado se hace en doble precision (como sklearn) y el resultado se
  // trunca a float32, que es lo que recibe el booster al construir el DMatrix.
  return fila.map((v, i) => Math.fround((v - scaler.mean[i]) / scaler.scale[i]))
}

/**
 * Combina la salida del modelo con la capa de interpretacion
 * medico-deportiva: 40% modelo, 60% heuristica, mas penalizaciones
 * por combinaciones clinicamente relevantes.
 */
function calcularScore(prob, d) {
  const scoreModelo = prob * 100

  const riesgos = [
    (d.Fatigue_Score / 10) * 100,
    (d.Training_Intensity / 10) * 100,
    d.ACL_Risk_Score,
    Math.max(0, ((5 - d.Recovery_Days_Per_Week) / 5) * 100),
    Math.max(0, ((8 - d.sleep_hours) / 8) * 100),
    (d.sleep_deficit / 3) * 100,
    Math.max(0, ((2 - d.hydration_liters) / 2) * 100),
  ]
  const scoreFeatures = riesgos.reduce((a, b) => a + b, 0) / riesgos.length

  let bonus = 0
  if (d.Fatigue_Score >= 7 && d.Training_Intensity >= 8) bonus += 12
  if (d.Recovery_Days_Per_Week <= 1 && d.Training_Hours_Per_Week >= 10) bonus += 10
  if (d.Rest_Between_Events_Days <= 1 && d.Match_Count_Per_Week >= 3) bonus += 8
  if (d.sleep_hours < 6.5) bonus += 6
  if (d.hydration_liters < 1.5) bonus += 5
  if (d.ACL_Risk_Score >= 70) bonus += 10
  if (d.Load_Balance_Score <= 30) bonus += 7

  const final = 0.4 * scoreModelo + 0.6 * scoreFeatures + bonus
  return Math.round(Math.min(100, Math.max(0, final)))
}

export function clasificarRiesgo(score) {
  if (score < 20) return { nivel: 'BAJO', color: '#27ae60' }
  if (score < 50) return { nivel: 'MEDIO', color: '#f39c12' }
  return { nivel: 'ALTO', color: '#e74c3c' }
}

function obtenerFactores(d, n = 3) {
  const f = []
  if (d.Fatigue_Score >= 7) f.push(['Fatiga elevada', `Score de fatiga: ${d.Fatigue_Score}/10`])
  if (d.Training_Intensity >= 8)
    f.push(['Intensidad muy alta', `Intensidad: ${d.Training_Intensity}/10`])
  if (d.Recovery_Days_Per_Week <= 1)
    f.push(['Recuperación insuficiente', `Solo ${d.Recovery_Days_Per_Week} día(s) de descanso`])
  if (d.sleep_hours < 6)
    f.push(['Privación de sueño', `Durmiendo ${d.sleep_hours}h (recomendado: 7-9h)`])
  if (d.sleep_deficit > 2)
    f.push(['Déficit de sueño acumulado', `Déficit: ${d.sleep_deficit.toFixed(1)}h`])
  if (d.ACL_Risk_Score >= 70) f.push(['Score ACL elevado', `Score: ${d.ACL_Risk_Score}/100`])
  if (d.Load_Balance_Score <= 30)
    f.push(['Desequilibrio de carga', `Load Balance: ${d.Load_Balance_Score}/100`])
  if (d.Rest_Between_Events_Days <= 1)
    f.push(['Poco descanso entre eventos', `Solo ${d.Rest_Between_Events_Days} día(s)`])
  if (d.hydration_liters < 1.5)
    f.push(['Hidratación insuficiente', `${d.hydration_liters}L/día (recomendado: >2L)`])
  if (d.meals_per_day <= 2) f.push(['Nutrición deficiente', `Solo ${d.meals_per_day} comidas/día`])

  if (!f.length) f.push(['Perfil saludable', 'No se detectan factores de riesgo elevados'])
  return f.slice(0, n)
}

function generarRecomendaciones(score, d) {
  const r = []
  if (d.Recovery_Days_Per_Week <= 1)
    r.push(
      'Valorar aumentar los días de recuperación a 2 o más por semana para favorecer la reparación muscular y reducir sobrecargas.',
    )
  if (d.sleep_hours < 7)
    r.push(
      `Priorizar higiene del sueño y descanso nocturno de 7-9h. Actualmente duermes ${d.sleep_hours}h, lo que puede afectar la recuperación neuromuscular.`,
    )
  if (d.Training_Intensity >= 8)
    r.push(
      'Revisar la carga de entrenamiento: alternar sesiones intensas con trabajo regenerativo para disminuir estrés articular y muscular.',
    )
  if (d.hydration_liters < 2)
    r.push(
      `Mejorar hidratación diaria. Con ${d.Training_Hours_Per_Week}h semanales de entrenamiento conviene situarse al menos en 2-3L/día.`,
    )
  if (d.meals_per_day <= 2)
    r.push(
      'Revisar la estrategia nutricional: 3-5 ingestas al día ayudan a mantener disponibilidad energética y recuperación tisular.',
    )
  if (d.Fatigue_Score >= 7)
    r.push(
      'La fatiga reportada es elevada. Valorar una semana de descarga reduciendo volumen o intensidad y monitorizar dolor, sueño y rendimiento.',
    )
  if (d.Rest_Between_Events_Days <= 1)
    r.push(
      'Aumentar, si es posible, el descanso entre competiciones a 2-3 días para reducir fatiga acumulada.',
    )

  if (score < 35)
    r.push('Mantener hábitos actuales y continuar monitorizando fatiga, sueño y molestias.')
  else if (score >= 65)
    r.push(
      'Por el perfil de riesgo, sería recomendable consultar con un fisioterapeuta, médico deportivo o preparador físico cualificado.',
    )

  return r.length
    ? r.slice(0, 4)
    : ['Mantener hábitos actuales. El perfil muestra riesgo bajo, sin sustituir una valoración clínica.']
}

/** Punto de entrada: datos del formulario → resultado completo. */
export function predecir(entrada) {
  const d = {
    ...entrada,
    sleep_deficit: Math.max(0, 7 - entrada.sleep_hours),
  }

  const prob = predecirProbabilidad(construirFeatures(d))
  const score = calcularScore(prob, d)

  return {
    probabilidad: prob,
    score,
    ...clasificarRiesgo(score),
    factores: obtenerFactores(d),
    recomendaciones: generarRecomendaciones(score, d),
  }
}

/** Valores por defecto, los mismos que trae la app de Streamlit. */
export const ENTRADA_INICIAL = {
  Age: 25,
  Height_cm: 175,
  Weight_kg: 75,
  Training_Intensity: 5,
  Training_Hours_Per_Week: 8,
  Recovery_Days_Per_Week: 2,
  Match_Count_Per_Week: 2,
  Rest_Between_Events_Days: 2,
  Fatigue_Score: 4,
  Performance_Score: 65,
  Team_Contribution_Score: 60,
  Load_Balance_Score: 70,
  ACL_Risk_Score: 40,
  sleep_hours: 7.5,
  sleep_quality: 7,
  meals_per_day: 3,
  hydration_liters: 2,
  Gender: 'Male',
  Position: 'Base',
  Deporte: 'Baloncesto',
}

/** Perfiles de ejemplo para que el visitante vea el contraste al instante. */
export const PERFILES = {
  saludable: {
    etiqueta: 'Atleta descansado',
    valores: {
      Training_Intensity: 5,
      Training_Hours_Per_Week: 7,
      Recovery_Days_Per_Week: 3,
      Match_Count_Per_Week: 1,
      Rest_Between_Events_Days: 3,
      Fatigue_Score: 3,
      Load_Balance_Score: 80,
      ACL_Risk_Score: 25,
      sleep_hours: 8,
      sleep_quality: 8,
      meals_per_day: 4,
      hydration_liters: 2.5,
    },
  },
  sobrecarga: {
    etiqueta: 'Semana de sobrecarga',
    valores: {
      Training_Intensity: 9,
      Training_Hours_Per_Week: 14,
      Recovery_Days_Per_Week: 1,
      Match_Count_Per_Week: 3,
      Rest_Between_Events_Days: 1,
      Fatigue_Score: 8,
      Load_Balance_Score: 28,
      ACL_Risk_Score: 75,
      sleep_hours: 5.5,
      sleep_quality: 4,
      meals_per_day: 2,
      hydration_liters: 1,
    },
  },
}
