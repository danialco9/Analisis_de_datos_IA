"""
Genera casos de referencia con el modelo REAL y la logica de app.py,
para comprobar despues que el port a JavaScript devuelve lo mismo.
"""

import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

warnings.filterwarnings('ignore')

PROYECTO = Path('C:/Users/dani/Documents/GitHub/Analisis_de_datos_IA/proyecto final')
SALIDA = Path(__file__).parent / 'casos_referencia.json'

modelo = joblib.load(PROYECTO / 'models' / 'mejor_modelo.pkl')
scaler = joblib.load(PROYECTO / 'models' / 'scaler.pkl')
feature_cols = joblib.load(PROYECTO / 'models' / 'feature_columns.pkl')

POSITION_MODEL_MAP = {
    "Base": "Guard", "Escolta": "Guard", "Alero": "Forward", "Ala-Pívot": "Forward",
    "Pívot": "Center", "Portero": "Center", "Defensa Central": "Defender",
    "Lateral": "Defender", "Centrocampista": "Midfielder", "Extremo": "Forward",
    "Delantero": "Forward", "Colocador/a": "Guard", "Receptor/a": "Forward",
    "Central": "Center", "Opuesto/a": "Forward", "Líbero": "Defender",
    "Velocista": "Guard", "Fondista": "Midfielder", "Saltador/a": "Forward",
    "Lanzador/a": "Center", "Nadador/a": "Guard", "Tenista": "Guard",
    "Solo musculación (sin deporte)": None,
}


# --- Copiado literal de proyecto final/app/app.py ---
def construir_features(datos, feature_cols):
    fila = {col: 0 for col in feature_cols}
    for k, v in datos.items():
        if k in fila:
            fila[k] = v
    gender_col = f"Gender_{datos['Gender']}"
    if gender_col in fila:
        fila[gender_col] = 1
    model_position = POSITION_MODEL_MAP.get(datos['Position'])
    if model_position:
        position_col = f"Position_{model_position}"
        if position_col in fila:
            fila[position_col] = 1
    df_input = pd.DataFrame([fila])
    return pd.DataFrame(scaler.transform(df_input), columns=feature_cols)


def calcular_score(prob, datos_raw):
    score_modelo = prob * 100
    riesgos = [
        datos_raw['Fatigue_Score'] / 10 * 100,
        datos_raw['Training_Intensity'] / 10 * 100,
        datos_raw['ACL_Risk_Score'],
        max(0, (5 - datos_raw['Recovery_Days_Per_Week']) / 5 * 100),
        max(0, (8 - datos_raw['sleep_hours']) / 8 * 100),
        datos_raw['sleep_deficit'] / 3 * 100,
        max(0, (2 - datos_raw['hydration_liters']) / 2 * 100),
    ]
    score_features = float(np.mean(riesgos))
    bonus_riesgo = 0
    if datos_raw['Fatigue_Score'] >= 7 and datos_raw['Training_Intensity'] >= 8:
        bonus_riesgo += 12
    if datos_raw['Recovery_Days_Per_Week'] <= 1 and datos_raw['Training_Hours_Per_Week'] >= 10:
        bonus_riesgo += 10
    if datos_raw['Rest_Between_Events_Days'] <= 1 and datos_raw['Match_Count_Per_Week'] >= 3:
        bonus_riesgo += 8
    if datos_raw['sleep_hours'] < 6.5:
        bonus_riesgo += 6
    if datos_raw['hydration_liters'] < 1.5:
        bonus_riesgo += 5
    if datos_raw['ACL_Risk_Score'] >= 70:
        bonus_riesgo += 10
    if datos_raw['Load_Balance_Score'] <= 30:
        bonus_riesgo += 7
    score_final = 0.40 * score_modelo + 0.60 * score_features + bonus_riesgo
    return int(round(np.clip(score_final, 0, 100)))


# --- Generacion de casos ---
rng = np.random.default_rng(7)
posiciones = list(POSITION_MODEL_MAP.keys())
casos = []

for _ in range(400):
    horas_sueno = float(rng.choice(np.arange(4.0, 10.5, 0.5)))
    entrada = {
        'Age': int(rng.integers(16, 56)),
        'Height_cm': int(rng.integers(150, 221)),
        'Weight_kg': int(rng.integers(45, 141)),
        'Training_Intensity': int(rng.integers(1, 11)),
        'Training_Hours_Per_Week': int(rng.integers(1, 31)),
        'Recovery_Days_Per_Week': int(rng.integers(0, 7)),
        'Match_Count_Per_Week': int(rng.integers(0, 8)),
        'Rest_Between_Events_Days': int(rng.integers(0, 8)),
        'Fatigue_Score': int(rng.integers(1, 11)),
        'Performance_Score': int(rng.integers(1, 101)),
        'Team_Contribution_Score': int(rng.integers(1, 101)),
        'Load_Balance_Score': int(rng.integers(1, 101)),
        'ACL_Risk_Score': int(rng.integers(1, 101)),
        'sleep_hours': horas_sueno,
        'sleep_quality': float(rng.choice(np.arange(1.0, 10.5, 0.5))),
        'meals_per_day': int(rng.integers(2, 7)),
        'hydration_liters': float(rng.choice(np.arange(1.0, 4.5, 0.5))),
        'Gender': str(rng.choice(['Male', 'Female'])),
        'Position': str(rng.choice(posiciones)),
    }

    datos_raw = dict(entrada)
    datos_raw['sleep_deficit'] = max(0, 7.0 - horas_sueno)

    prob = float(modelo.predict_proba(construir_features(datos_raw, feature_cols))[0][1])
    casos.append({
        'entrada': entrada,
        'probabilidad': prob,
        'score': calcular_score(prob, datos_raw),
    })

SALIDA.write_text(json.dumps(casos), encoding='utf-8')
print(f'{len(casos)} casos escritos en {SALIDA.name}')
print(f'Rango de score: {min(c["score"] for c in casos)} - {max(c["score"] for c in casos)}')
