/**
 * Comprueba que el port a JavaScript del modelo de riesgo de lesion
 * reproduce exactamente lo que devuelve el modelo original en Python.
 *
 * Uso:  npm run verificar-modelo
 *
 * Los casos de `casos_referencia.json` se generan con `generar_casos.py`,
 * que carga los .pkl reales del TFM. Si reentrenas el modelo, regenera
 * primero los casos y vuelve a exportar con `exportar_modelo.py`.
 */

import { readFileSync } from 'node:fs'
import { predecir } from '../src/lib/modeloLesiones.js'

const casos = JSON.parse(
  readFileSync(new URL('./casos_referencia.json', import.meta.url), 'utf-8'),
)

let maxDiffProb = 0
const scoresDistintos = []

for (const caso of casos) {
  const r = predecir(caso.entrada)

  const diff = Math.abs(r.probabilidad - caso.probabilidad)
  if (diff > maxDiffProb) maxDiffProb = diff

  if (r.score !== caso.score) {
    scoresDistintos.push({
      esperado: caso.score,
      obtenido: r.score,
      probPy: caso.probabilidad,
      probJs: r.probabilidad,
    })
  }
}

console.log(`Casos comparados        : ${casos.length}`)
console.log(`Diferencia max en prob  : ${maxDiffProb.toExponential(3)}`)
console.log(`Scores que no coinciden : ${scoresDistintos.length}`)

if (scoresDistintos.length) {
  console.log('\nPrimeros desajustes:')
  for (const d of scoresDistintos.slice(0, 5)) console.log(' ', d)
  process.exit(1)
}

if (maxDiffProb > 1e-6) {
  console.log('\nLa probabilidad se desvia mas de lo tolerable.')
  process.exit(1)
}

console.log('\nOK: el port a JavaScript reproduce el modelo de Python.')
