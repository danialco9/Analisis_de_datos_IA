"""
Exporta el modelo XGBoost del TFM a JSON para poder ejecutarlo en el navegador.

No basta con volcar los arboles: hay que verificar que evaluarlos "a mano"
reproduce exactamente lo que devuelve model.predict_proba(). Si la diferencia
maxima supera la tolerancia, el script falla y no se escribe nada.
"""

import json
import math
import warnings
from pathlib import Path

import joblib
import numpy as np

warnings.filterwarnings('ignore')

RAIZ = Path(__file__).resolve()
PROYECTO = Path('C:/Users/dani/Documents/GitHub/Analisis_de_datos_IA/proyecto final')
SALIDA = Path('C:/Users/dani/Documents/GitHub/Analisis_de_datos_IA/portfolio/src/data')

modelo = joblib.load(PROYECTO / 'models' / 'mejor_modelo.pkl')
scaler = joblib.load(PROYECTO / 'models' / 'scaler.pkl')
feature_cols = joblib.load(PROYECTO / 'models' / 'feature_columns.pkl')

print(f'Modelo      : {type(modelo).__name__}')
print(f'Features    : {len(feature_cols)}')

booster = modelo.get_booster()

# Volcado de los arboles en JSON.
arboles = [json.loads(t) for t in booster.get_dump(dump_format='json')]
print(f'Arboles     : {len(arboles)}')

# base_score: el sesgo inicial en espacio logit.
config = json.loads(booster.save_config())
# Segun la version, base_score llega como "0.5" o como vector "[5E-1]".
crudo = config['learner']['learner_model_param']['base_score']
base_score = float(str(crudo).strip('[]').split(',')[0])
print(f'base_score  : {base_score}  (crudo: {crudo})')

# El orden de features que espera el booster.
nombres_booster = booster.feature_names
if nombres_booster is None:
    nombres_booster = list(feature_cols)
print(f'Orden ok    : {list(nombres_booster) == list(feature_cols)}')


def evaluar_arbol(nodo, fila):
    """Recorre un arbol hasta una hoja. Replica lo que hara el JS."""
    while 'leaf' not in nodo:
        split = nodo['split']
        idx = nombres_booster.index(split) if isinstance(split, str) else int(split)
        valor = fila[idx]

        if valor is None or (isinstance(valor, float) and math.isnan(valor)):
            siguiente_id = nodo['missing']
        else:
            siguiente_id = nodo['yes'] if valor < nodo['split_condition'] else nodo['no']

        nodo = next(h for h in nodo['children'] if h['nodeid'] == siguiente_id)
    return nodo['leaf']


def predecir_manual(fila):
    logit = math.log(base_score / (1 - base_score)) if 0 < base_score < 1 else 0.0
    logit += sum(evaluar_arbol(a, fila) for a in arboles)
    return 1 / (1 + math.exp(-logit))


# ── Verificacion contra el modelo real ────────────────────────
rng = np.random.default_rng(42)
N = 500
X = rng.normal(0, 1.5, size=(N, len(feature_cols)))

esperado = modelo.predict_proba(X)[:, 1]
obtenido = np.array([predecir_manual(list(map(float, f))) for f in X])

diferencia = np.abs(esperado - obtenido)
print(f'\nDiferencia maxima sobre {N} casos: {diferencia.max():.3e}')

TOLERANCIA = 1e-6
if diferencia.max() > TOLERANCIA:
    raise SystemExit(
        f'ABORTADO: la diferencia ({diferencia.max():.3e}) supera la tolerancia '
        f'({TOLERANCIA}). El modelo exportado NO reproduce al original.'
    )

print('VERIFICADO: el modelo exportado reproduce al original.')

# ── Escritura ─────────────────────────────────────────────────
payload = {
    'featureNames': list(nombres_booster),
    'baseScore': base_score,
    'trees': arboles,
    'scaler': {
        'mean': [float(v) for v in scaler.mean_],
        'scale': [float(v) for v in scaler.scale_],
    },
    'meta': {
        'modelo': type(modelo).__name__,
        'nArboles': len(arboles),
        'nFeatures': len(feature_cols),
        'verificadoDiffMax': float(diferencia.max()),
    },
}

SALIDA.mkdir(parents=True, exist_ok=True)
destino = SALIDA / 'modelo_lesiones.json'
destino.write_text(json.dumps(payload, separators=(',', ':')), encoding='utf-8')

kb = destino.stat().st_size / 1024
print(f'Escrito     : {destino.name} ({kb:.0f} KB)')
