import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.graph_objects as go
import os
from datetime import date, timedelta

# ── Configuración de página ─────────────────────────────────
st.set_page_config(
    page_title="Predicción de Riesgo de Lesión",
    page_icon="R",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Estilos ─────────────────────────────────────────────────
st.markdown("""
<style>
    .riesgo-bajo    { background:#d5f5e3; border-left:6px solid #27ae60; padding:16px; border-radius:8px; color:#1a5c35 !important; }
    .riesgo-medio   { background:#fef9e7; border-left:6px solid #f39c12; padding:16px; border-radius:8px; color:#7d5a00 !important; }
    .riesgo-alto    { background:#fadbd8; border-left:6px solid #e74c3c; padding:16px; border-radius:8px; color:#7b1c1c !important; }
    .riesgo-bajo h2, .riesgo-bajo p, .riesgo-bajo strong { color:#1a5c35 !important; }
    .riesgo-medio h2, .riesgo-medio p, .riesgo-medio strong { color:#7d5a00 !important; }
    .riesgo-alto h2, .riesgo-alto p, .riesgo-alto strong { color:#7b1c1c !important; }
    .factor-card    { background:#f0f2f6; border:1px solid #cdd3df; padding:12px; border-radius:8px; margin:4px 0; color:#2c3e50 !important; }
    .factor-card strong { color:#2c3e50 !important; }
    .factor-card small  { color:#555 !important; }
    .recomendacion  { background:#eaf4fb; border-left:4px solid #3498db; padding:12px; border-radius:6px; margin:6px 0; color:#1a3a4a !important; }
    .metric-card     { background:#ffffff; border:1px solid #d9dee8; padding:14px; border-radius:8px; min-height:92px; }
    .metric-card small { color:#687385; font-size:13px; }
    .metric-card h3  { margin:4px 0 0 0; color:#223044; font-size:28px; }
    .alerta-card     { background:#fff7ed; border-left:4px solid #f97316; padding:12px; border-radius:6px; margin:6px 0; color:#7c2d12; }
    h1              { color: #2c3e50; }
</style>
""", unsafe_allow_html=True)

# ── Carga de artefactos ─────────────────────────────────────
@st.cache_resource
def cargar_modelo():
    base = os.path.join(os.path.dirname(__file__), '..', 'models')
    modelo        = joblib.load(os.path.join(base, 'mejor_modelo.pkl'))
    scaler        = joblib.load(os.path.join(base, 'scaler.pkl'))
    feature_cols  = joblib.load(os.path.join(base, 'feature_columns.pkl'))
    nombre_modelo = joblib.load(os.path.join(base, 'mejor_modelo_nombre.pkl'))
    return modelo, scaler, feature_cols, nombre_modelo

modelo, scaler, feature_cols, nombre_modelo = cargar_modelo()
SEGUIMIENTO_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'data', 'processed', 'seguimiento_atleta.csv'
)

# ── Deportes y posiciones ───────────────────────────────────
SPORT_POSITIONS = {
    "Baloncesto":       ["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"],
    "Fútbol":           ["Portero", "Defensa Central", "Lateral", "Centrocampista", "Extremo", "Delantero"],
    "Fútbol Americano": ["Quarterback", "Running Back", "Wide Receiver", "Lineman", "Linebacker"],
    "Vóley":            ["Colocador/a", "Receptor/a", "Central", "Opuesto/a", "Líbero"],
    "Atletismo":        ["Velocista", "Fondista", "Saltador/a", "Lanzador/a"],
    "Natación":         ["Nadador/a"],
    "Tenis":            ["Tenista"],
    "Gym / Musculación": ["Solo musculación (sin deporte)"],
    "Otro deporte":     ["Otro"],
}

# Mapeo a las columnas que conoce el modelo (entrenado con Guard/Forward/Center/Midfielder/Defender)
POSITION_MODEL_MAP = {
    "Base": "Guard", "Escolta": "Guard",
    "Alero": "Forward", "Ala-Pívot": "Forward", "Pívot": "Center",
    "Portero": "Center", "Defensa Central": "Defender",
    "Lateral": "Defender", "Centrocampista": "Midfielder",
    "Extremo": "Forward", "Delantero": "Forward",
    "Quarterback": "Guard", "Running Back": "Forward",
    "Wide Receiver": "Forward", "Lineman": "Center", "Linebacker": "Defender",
    "Colocador/a": "Guard", "Receptor/a": "Forward",
    "Central": "Center", "Opuesto/a": "Forward", "Líbero": "Defender",
    "Velocista": "Guard", "Fondista": "Midfielder",
    "Saltador/a": "Forward", "Lanzador/a": "Center",
    "Nadador/a": "Guard", "Tenista": "Guard",
    "Solo musculación (sin deporte)": None,
    "Otro": None,
}

# ── Funciones auxiliares ────────────────────────────────────
def construir_features(datos, feature_cols):
    """Convierte los datos del formulario en el vector de 23 features."""
    fila = {col: 0 for col in feature_cols}

    # Features numéricas directas
    for k, v in datos.items():
        if k in fila:
            fila[k] = v

    # One-Hot Encoding de Gender
    gender_col = f"Gender_{datos['Gender']}"
    if gender_col in fila:
        fila[gender_col] = 1

    # One-Hot Encoding de Position (usando el mapeo al nombre que conoce el modelo)
    model_position = POSITION_MODEL_MAP.get(datos['Position'])
    if model_position:
        position_col = f"Position_{model_position}"
        if position_col in fila:
            fila[position_col] = 1

    df_input = pd.DataFrame([fila])
    df_scaled = pd.DataFrame(scaler.transform(df_input), columns=feature_cols)
    return df_scaled

def calcular_score(prob, datos_raw):
    """Combina modelo y factores médico-deportivos para un score más sensible."""
    score_modelo = prob * 100

    # Score complementario basado en features clave.
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

    # Penalizaciones por combinaciones de riesgo que clínicamente son más relevantes
    # que cada variable aislada.
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

def clasificar_riesgo(score):
    if score < 20:
        return "BAJO", "#27ae60", "riesgo-bajo", ""
    elif score < 50:
        return "MEDIO", "#f39c12", "riesgo-medio", ""
    else:
        return "ALTO", "#e74c3c", "riesgo-alto", ""

def gauge_chart(score, color):
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=score,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': "Score de Riesgo", 'font': {'size': 18}},
        number={'font': {'size': 48, 'color': color}},
        gauge={
            'axis': {'range': [0, 100], 'tickwidth': 1},
            'bar': {'color': color, 'thickness': 0.3},
            'steps': [
                {'range': [0, 20],  'color': '#d5f5e3'},
                {'range': [20, 50], 'color': '#fef9e7'},
                {'range': [50, 100],'color': '#fadbd8'},
            ],
            'threshold': {
                'line': {'color': color, 'width': 4},
                'thickness': 0.75,
                'value': score
            }
        }
    ))
    fig.update_layout(height=280, margin=dict(t=40, b=10, l=20, r=20))
    return fig

def obtener_factores_riesgo(datos_raw, n=3):
    """Devuelve los n factores que más elevan el riesgo según umbrales."""
    factores = []

    if datos_raw['Fatigue_Score'] >= 7:
        factores.append(("Fatiga elevada", f"Score de fatiga: {datos_raw['Fatigue_Score']}/10"))
    if datos_raw['Training_Intensity'] >= 8:
        factores.append(("Intensidad de entrenamiento muy alta", f"Intensidad: {datos_raw['Training_Intensity']}/10"))
    if datos_raw['Recovery_Days_Per_Week'] <= 1:
        factores.append(("Recuperación insuficiente", f"Solo {datos_raw['Recovery_Days_Per_Week']} día(s) de descanso/semana"))
    if datos_raw['sleep_hours'] < 6:
        factores.append(("Privación de sueño", f"Durmiendo {datos_raw['sleep_hours']}h (recomendado: 7-9h)"))
    if datos_raw['sleep_deficit'] > 2:
        factores.append(("Déficit de sueño acumulado", f"Déficit: {datos_raw['sleep_deficit']}h"))
    if datos_raw['ACL_Risk_Score'] >= 70:
        factores.append(("Score ACL elevado", f"Score: {datos_raw['ACL_Risk_Score']}/100"))
    if datos_raw['Load_Balance_Score'] <= 30:
        factores.append(("Desequilibrio de carga", f"Load Balance: {datos_raw['Load_Balance_Score']}/100"))
    if datos_raw['Rest_Between_Events_Days'] <= 1:
        factores.append(("Poco descanso entre eventos", f"Solo {datos_raw['Rest_Between_Events_Days']} día(s) entre competiciones"))
    if datos_raw['hydration_liters'] < 1.5:
        factores.append(("Hidratación insuficiente", f"{datos_raw['hydration_liters']}L/día (recomendado: >2L)"))
    if datos_raw['meals_per_day'] <= 2:
        factores.append(("Nutrición deficiente", f"Solo {datos_raw['meals_per_day']} comidas/día"))

    if not factores:
        factores.append(("Perfil saludable", "No se detectan factores de riesgo elevados"))

    return factores[:n]

def generar_recomendaciones(score, datos_raw):
    """Genera recomendaciones personalizadas con enfoque médico-deportivo."""
    recomendaciones = []

    if datos_raw['Recovery_Days_Per_Week'] <= 1:
        recomendaciones.append("Valorar aumentar los días de recuperación a 2 o más por semana para favorecer la reparación muscular y reducir sobrecargas.")
    if datos_raw['sleep_hours'] < 7:
        recomendaciones.append(f"Priorizar higiene del sueño y descanso nocturno de 7-9h. Actualmente duermes {datos_raw['sleep_hours']}h, lo que puede afectar la recuperación neuromuscular.")
    if datos_raw['Training_Intensity'] >= 8:
        recomendaciones.append("Revisar la carga de entrenamiento: alternar sesiones intensas con trabajo regenerativo para disminuir estrés articular y muscular.")
    if datos_raw['hydration_liters'] < 2:
        recomendaciones.append(f"Mejorar hidratación diaria. Con {datos_raw['Training_Hours_Per_Week']}h semanales de entrenamiento conviene situarse al menos en 2-3L/día, ajustando por sudoración.")
    if datos_raw['meals_per_day'] <= 2:
        recomendaciones.append("Revisar la estrategia nutricional: 3-5 ingestas al día pueden ayudar a mantener disponibilidad energética y recuperación tisular.")
    if datos_raw['Fatigue_Score'] >= 7:
        recomendaciones.append("La fatiga reportada es elevada. Valorar una semana de descarga reduciendo volumen o intensidad y monitorizar dolor, sueño y rendimiento.")
    if datos_raw['Rest_Between_Events_Days'] <= 1:
        recomendaciones.append("Aumentar, si es posible, el descanso entre competiciones a 2-3 días para reducir fatiga acumulada y riesgo de lesión aguda.")

    if score < 35:
        recomendaciones.append("Mantener hábitos actuales y continuar monitorizando fatiga, sueño y molestias musculoesqueléticas.")
    elif score >= 65:
        recomendaciones.append("Por el perfil de riesgo, sería recomendable consultar con un fisioterapeuta, médico deportivo o preparador físico cualificado.")

    return recomendaciones[:4] if recomendaciones else ["Mantener hábitos actuales. El perfil muestra riesgo bajo, sin sustituir una valoración clínica individual."]

def estimar_lesiones_potenciales(datos_raw, score, n=4):
    """Relaciona factores de riesgo con lesiones posibles; no es diagnóstico."""
    lesiones = []
    deporte = datos_raw.get('Deporte', '')

    if datos_raw['ACL_Risk_Score'] >= 65 or (datos_raw['Training_Intensity'] >= 8 and datos_raw['Fatigue_Score'] >= 7):
        lesiones.append(("Rodilla / LCA", "Mayor exposición a cambios de dirección, saltos o fatiga neuromuscular. Vigilar dolor, inestabilidad o inflamación."))
    if datos_raw['Load_Balance_Score'] <= 35 or datos_raw['Recovery_Days_Per_Week'] <= 1:
        lesiones.append(("Sobrecarga muscular", "La recuperación limitada puede favorecer contracturas, roturas fibrilares o molestias persistentes."))
    if datos_raw['Training_Hours_Per_Week'] >= 12 or datos_raw['Rest_Between_Events_Days'] <= 1:
        lesiones.append(("Tendinopatías", "El volumen alto y poco descanso se asocian a irritación de tendón rotuliano, aquileo u hombro según deporte."))
    if "Vóley" in deporte or datos_raw['Match_Count_Per_Week'] >= 3:
        lesiones.append(("Hombro y tobillo", "En deportes con saltos y gestos por encima de la cabeza puede aumentar el riesgo de esguince, sobrecarga de hombro o dolor rotuliano."))
    if datos_raw['sleep_hours'] < 6 or datos_raw['sleep_deficit'] > 2:
        lesiones.append(("Fatiga y sobreentrenamiento", "El déficit de sueño puede afectar coordinación, reacción y tolerancia a la carga."))
    if datos_raw['hydration_liters'] < 1.5 or datos_raw['meals_per_day'] <= 2:
        lesiones.append(("Calambres o bajo rendimiento", "Hidratación o ingesta insuficiente pueden elevar fatiga, calambres y peor recuperación."))
    if score >= 65:
        lesiones.append(("Lesión aguda por fatiga", "Con riesgo alto conviene evitar incrementos bruscos de carga y revisar técnica, descanso y planificación."))

    if not lesiones:
        lesiones.append(("Sin señales críticas", "No se detectan indicadores destacados, aunque conviene mantener prevención, movilidad y control de carga."))

    return lesiones[:n]

def predecir_desde_datos(datos_raw):
    """Calcula probabilidad, score y nivel para un registro del atleta."""
    X_input = construir_features(datos_raw, feature_cols)
    prob = float(modelo.predict_proba(X_input)[0][1])
    score = calcular_score(prob, datos_raw)
    nivel, color, css_class, icono = clasificar_riesgo(score)
    return prob, score, nivel, color, css_class, icono

def cargar_registros():
    if not os.path.exists(SEGUIMIENTO_PATH):
        return pd.DataFrame()

    df = pd.read_csv(SEGUIMIENTO_PATH)
    if not df.empty and "Fecha" in df.columns:
        df["Fecha"] = pd.to_datetime(df["Fecha"]).dt.date
    for columna in ["Recomendaciones", "Posibles lesiones", "Efectos negativos"]:
        if columna not in df.columns:
            df[columna] = ""
    return df

def guardar_registro(registro):
    os.makedirs(os.path.dirname(SEGUIMIENTO_PATH), exist_ok=True)
    df_actual = cargar_registros()
    nuevo = pd.DataFrame([registro])

    if not df_actual.empty and "Fecha" in df_actual.columns:
        df_actual = df_actual[df_actual["Fecha"].astype(str) != str(registro["Fecha"])]

    df_final = pd.concat([df_actual, nuevo], ignore_index=True)
    df_final["Fecha"] = pd.to_datetime(df_final["Fecha"])
    df_final = df_final.sort_values("Fecha")
    df_final.to_csv(SEGUIMIENTO_PATH, index=False)

def borrar_registros():
    if os.path.exists(SEGUIMIENTO_PATH):
        os.remove(SEGUIMIENTO_PATH)

def crear_registro_historial(fecha_registro, datos_registro, genero_label, molestias=""):
    prob, score, nivel, _, _, _ = predecir_desde_datos(datos_registro)
    recomendaciones = generar_recomendaciones(score, datos_registro)
    lesiones = estimar_lesiones_potenciales(datos_registro, score)
    efectos = generar_efectos_negativos(datos_registro, score)
    return {
        "Fecha": fecha_registro,
        "Deporte": datos_registro["Deporte"],
        "Posición": datos_registro["Position"],
        "Género": genero_label,
        "Edad": datos_registro["Age"],
        "Score": score,
        "Nivel": nivel,
        "Probabilidad": round(prob * 100, 2),
        "Fatiga": datos_registro["Fatigue_Score"],
        "Sueño": datos_registro["sleep_hours"],
        "Calidad sueño": datos_registro["sleep_quality"],
        "Hidratación": datos_registro["hydration_liters"],
        "Comidas": datos_registro["meals_per_day"],
        "Intensidad": datos_registro["Training_Intensity"],
        "Horas semana": datos_registro["Training_Hours_Per_Week"],
        "Descanso": datos_registro["Recovery_Days_Per_Week"],
        "Molestias": molestias,
        "Recomendaciones": " | ".join(recomendaciones),
        "Posibles lesiones": " | ".join([nombre for nombre, _ in lesiones]),
        "Efectos negativos": " | ".join(efectos),
    }

def guardar_rango_registros(fecha_inicio, fecha_fin, datos_registro, genero_label, molestias=""):
    dias_rango = (fecha_fin - fecha_inicio).days + 1
    for offset in range(dias_rango):
        fecha_dia = fecha_inicio + timedelta(days=offset)
        guardar_registro(crear_registro_historial(fecha_dia, datos_registro, genero_label, molestias))
    return dias_rango

def cargar_demo(tipo, datos_base, genero_label):
    patrones = {
        "saludable": [
            {"fatiga": 3, "intensidad": 4, "sueno": 8.0, "hidratacion": 2.5, "descanso": 3, "nota": "Semana saludable"},
            {"fatiga": 4, "intensidad": 5, "sueno": 7.5, "hidratacion": 2.5, "descanso": 3, "nota": "Semana saludable"},
            {"fatiga": 3, "intensidad": 4, "sueno": 8.0, "hidratacion": 3.0, "descanso": 4, "nota": "Semana saludable"},
            {"fatiga": 4, "intensidad": 5, "sueno": 7.5, "hidratacion": 2.5, "descanso": 3, "nota": "Semana saludable"},
            {"fatiga": 5, "intensidad": 6, "sueno": 7.0, "hidratacion": 2.5, "descanso": 2, "nota": "Entreno moderado"},
            {"fatiga": 4, "intensidad": 4, "sueno": 8.0, "hidratacion": 3.0, "descanso": 3, "nota": "Recuperación correcta"},
            {"fatiga": 3, "intensidad": 3, "sueno": 8.5, "hidratacion": 3.0, "descanso": 4, "nota": "Descanso activo"},
        ],
        "sobrecarga": [
            {"fatiga": 5, "intensidad": 6, "sueno": 7.0, "hidratacion": 2.0, "descanso": 2, "nota": "Inicio de carga"},
            {"fatiga": 6, "intensidad": 7, "sueno": 6.5, "hidratacion": 2.0, "descanso": 2, "nota": "Carga alta"},
            {"fatiga": 7, "intensidad": 8, "sueno": 6.0, "hidratacion": 1.5, "descanso": 1, "nota": "Fatiga acumulada"},
            {"fatiga": 8, "intensidad": 8, "sueno": 6.0, "hidratacion": 1.5, "descanso": 1, "nota": "Molestias leves"},
            {"fatiga": 8, "intensidad": 9, "sueno": 5.5, "hidratacion": 1.5, "descanso": 1, "nota": "Sobrecarga"},
            {"fatiga": 9, "intensidad": 9, "sueno": 5.5, "hidratacion": 1.0, "descanso": 0, "nota": "Riesgo elevado"},
            {"fatiga": 8, "intensidad": 7, "sueno": 6.0, "hidratacion": 1.5, "descanso": 1, "nota": "Necesita descarga"},
        ],
    }

    fecha_inicio = date.today() - timedelta(days=6)
    for offset, patron in enumerate(patrones[tipo]):
        datos_dia = datos_base.copy()
        datos_dia.update({
            "Fatigue_Score": patron["fatiga"],
            "Training_Intensity": patron["intensidad"],
            "sleep_hours": patron["sueno"],
            "sleep_quality": min(10.0, max(1.0, patron["sueno"])),
            "sleep_deficit": max(0, 7.0 - patron["sueno"]),
            "hydration_liters": patron["hidratacion"],
            "Recovery_Days_Per_Week": patron["descanso"],
        })
        guardar_registro(crear_registro_historial(
            fecha_inicio + timedelta(days=offset),
            datos_dia,
            genero_label,
            patron["nota"],
        ))

def generar_alertas_periodo(df_periodo):
    alertas = []
    if (df_periodo["Score"] >= 50).sum() >= 3:
        alertas.append("Hay 3 o más días en riesgo alto dentro del periodo.")
    if (df_periodo["Sueño"] < 7).sum() >= 3:
        alertas.append("El sueño está por debajo de 7 horas en varios días.")
    if (df_periodo["Fatiga"] >= 7).sum() >= 2:
        alertas.append("La fatiga alta aparece de forma repetida.")
    if (df_periodo["Hidratación"] < 2).sum() >= 3:
        alertas.append("La hidratación es baja en varios registros.")
    if len(df_periodo) >= 2 and (df_periodo["Score"].iloc[-1] - df_periodo["Score"].iloc[0]) > 10:
        alertas.append("La tendencia del riesgo va al alza respecto al inicio del periodo.")
    return alertas

def generar_efectos_negativos(datos_raw, score):
    efectos = []
    if score >= 65:
        efectos.append("Mayor probabilidad de sobrecarga o lesión si se mantiene la carga actual")
    if datos_raw["Fatigue_Score"] >= 7:
        efectos.append("Fatiga acumulada y peor coordinación neuromuscular")
    if datos_raw["sleep_hours"] < 7:
        efectos.append("Recuperación incompleta por descanso insuficiente")
    if datos_raw["hydration_liters"] < 2:
        efectos.append("Mayor riesgo de calambres, fatiga y bajo rendimiento por hidratación baja")
    if datos_raw["Recovery_Days_Per_Week"] <= 1:
        efectos.append("Poco margen de reparación muscular entre sesiones")
    if datos_raw["Training_Intensity"] >= 8:
        efectos.append("Estrés articular y muscular elevado por intensidad alta")
    if datos_raw["meals_per_day"] <= 2:
        efectos.append("Disponibilidad energética limitada para entrenar y recuperarse")

    if not efectos:
        efectos.append("Sin efectos negativos destacados en el registro")

    return efectos[:4]

def valorar_seguimiento(df_seguimiento):
    """Resume la evolución de un periodo en una valoración final interpretable."""
    media_score = df_seguimiento["Score"].mean()
    dias_altos = int((df_seguimiento["Score"] >= 50).sum())
    tendencia = df_seguimiento["Score"].iloc[-1] - df_seguimiento["Score"].iloc[0]
    media_sueno = df_seguimiento["Sueño"].mean()
    media_fatiga = df_seguimiento["Fatiga"].mean()

    if media_score >= 65 or dias_altos >= 3:
        titulo = "Riesgo acumulado alto"
        mensaje = "El periodo muestra varios días de carga elevada o recuperación insuficiente. Conviene reducir intensidad, priorizar sueño y revisar el plan con un profesional."
    elif media_score >= 35 or dias_altos >= 1:
        titulo = "Riesgo acumulado moderado"
        mensaje = "La evolución es aceptable, pero aparecen señales de fatiga o carga que conviene vigilar durante los próximos entrenamientos."
    else:
        titulo = "Perfil estable"
        mensaje = "El periodo se mantiene en un rango preventivo favorable. La recomendación principal es sostener los hábitos actuales y seguir monitorizando."

    if tendencia > 10:
        tendencia_txt = "empeora durante el periodo"
    elif tendencia < -10:
        tendencia_txt = "mejora durante el periodo"
    else:
        tendencia_txt = "se mantiene estable"

    return titulo, mensaje, tendencia_txt, media_score, dias_altos, media_sueno, media_fatiga

# ── INTERFAZ PRINCIPAL ──────────────────────────────────────
st.title("Sistema de Predicción de Riesgo de Lesión")
st.caption(f"Modelo activo: **{nombre_modelo}** · Precisión: 96% · ROC-AUC: 0.999 · Variables: 23")
st.divider()

# ── SIDEBAR: Formulario de entrada ─────────────────────────
with st.sidebar:
    st.header("Datos del Atleta")

    st.subheader("Perfil")
    edad   = st.slider("Edad", 16, 55, 25)
    genero_label = st.selectbox("Género", ["Masculino", "Femenino"])
    genero = {"Masculino": "Male", "Femenino": "Female"}[genero_label]
    altura = st.slider("Altura (cm)", 150, 220, 175)
    peso   = st.slider("Peso (kg)", 45, 140, 75)

    deporte  = st.selectbox("Deporte / Actividad", list(SPORT_POSITIONS.keys()))
    opciones = SPORT_POSITIONS[deporte]
    if len(opciones) == 1:
        posicion = opciones[0]
        st.caption(f"Posición: **{posicion}**")
    else:
        posicion = st.selectbox("Posición / Rol", opciones)

    es_gym = (deporte == "Gym / Musculación")

    st.subheader("Entrenamiento")
    intensidad   = st.slider("Intensidad (1-10)", 1, 10, 5)
    horas_semana = st.slider("Horas/semana", 1, 30, 8)
    dias_recup   = st.slider("Días descanso/semana", 0, 6, 2)
    if es_gym:
        partidos  = 0
        dias_entre = 1
        st.caption("Sin competiciones — campos de eventos no aplican.")
    else:
        partidos   = st.slider("Partidos o eventos/semana", 0, 7, 2)
        dias_entre = st.slider("Días entre eventos", 0, 7, 2)

    st.subheader("Estado físico")
    fatiga        = st.slider("Fatiga (1-10)", 1, 10, 4)
    rendimiento   = st.slider("Rendimiento percibido (1-100)", 1, 100, 65)
    contribucion  = st.slider("Contribución al equipo (1-100)", 1, 100, 60)
    load_balance  = st.slider("Equilibrio de carga (1-100)", 1, 100, 70)
    acl_score     = st.slider("Score ACL (1-100)", 1, 100, 40)

    st.subheader("Sueño")
    horas_sueño   = st.slider("Horas de sueño", 4.0, 10.0, 7.5, step=0.5)
    calidad_sueño = st.slider("Calidad del sueño (1-10)", 1.0, 10.0, 7.0, step=0.5)

    st.subheader("Nutrición e hidratación")
    comidas       = st.slider("Comidas al día", 2, 6, 3)
    hidratacion   = st.slider("Hidratación (litros/día)", 1.0, 4.0, 2.0, step=0.5)

    predecir = st.button("Predecir riesgo", type="primary", use_container_width=True)

# ── ÁREA PRINCIPAL ──────────────────────────────────────────
datos_raw = {
    'Age': edad, 'Height_cm': altura, 'Weight_kg': peso,
    'Training_Intensity': intensidad, 'Training_Hours_Per_Week': horas_semana,
    'Recovery_Days_Per_Week': dias_recup, 'Match_Count_Per_Week': partidos,
    'Rest_Between_Events_Days': dias_entre, 'Fatigue_Score': fatiga,
    'Performance_Score': rendimiento, 'Team_Contribution_Score': contribucion,
    'Load_Balance_Score': load_balance, 'ACL_Risk_Score': acl_score,
    'sleep_hours': horas_sueño, 'sleep_quality': calidad_sueño,
    'sleep_deficit': max(0, 7.0 - horas_sueño),
    'meals_per_day': comidas, 'hydration_liters': hidratacion,
    'Gender': genero, 'Position': posicion, 'Deporte': deporte,
}

tab_prediccion, tab_registro, tab_seguimiento = st.tabs([
    "Predicción individual",
    "Registro diario",
    "Seguimiento semanal/mensual",
])

with tab_prediccion:
    if not predecir:
        col1, col2, col3 = st.columns(3)
        col1.metric("Modelos entrenados", "4", "LR · RF · XGBoost · Ensemble")
        col2.metric("Precisión del modelo", "96%", "en conjunto de test")
        col3.metric("ROC-AUC", "0.999", "prácticamente perfecto")

        st.info("👈 Introduce los datos del atleta en el panel izquierdo y pulsa **Predecir Riesgo**.")

        st.subheader("¿Cómo funciona?")
        st.markdown("""
        1. **Introduce los datos** del atleta en el formulario lateral
        2. El sistema calcula **23 features** automáticamente
        3. El modelo ML predice el **score de riesgo (0-100)**
        4. Recibes una clasificación **BAJO / MEDIO / ALTO** con recomendaciones personalizadas
        """)

    else:
        prob, score, nivel, color, css_class, icono = predecir_desde_datos(datos_raw)

        col_gauge, col_resultado = st.columns([1, 2])

        with col_gauge:
            st.plotly_chart(gauge_chart(score, color), use_container_width=True, key="gauge_prediccion")

        with col_resultado:
            deporte_label = datos_raw.get('Deporte', '')
            st.markdown(f"""
            <div class="{css_class}">
                <h2 style="margin:0">Riesgo {nivel}</h2>
                <p style="margin:8px 0 0 0; font-size:16px">
                    Score de riesgo: <strong>{score}/100</strong> · Probabilidad de lesión: <strong>{prob*100:.1f}%</strong>
                </p>
                <p style="margin:4px 0 0 0; font-size:13px; opacity:0.85">
                    {deporte_label} · {posicion}
                </p>
            </div>
            """, unsafe_allow_html=True)

            st.markdown("")
            st.markdown("**Principales factores de riesgo detectados:**")
            factores = obtener_factores_riesgo(datos_raw)
            for nombre_f, detalle_f in factores:
                st.markdown(f"""
                <div class="factor-card">
                    <strong>{nombre_f}</strong><br>
                    <small style="color:#666">{detalle_f}</small>
                </div>
                """, unsafe_allow_html=True)

        st.divider()

        st.subheader("Recomendaciones personalizadas")
        recomendaciones = generar_recomendaciones(score, datos_raw)
        cols = st.columns(2)
        for i, rec in enumerate(recomendaciones):
            with cols[i % 2]:
                st.markdown(f"""
                <div class="recomendacion">
                    {rec}
                </div>
                """, unsafe_allow_html=True)

        st.divider()

        st.subheader("Posibles lesiones asociadas")
        st.caption("Estimación orientativa basada en factores de riesgo. No equivale a diagnóstico médico.")
        lesiones = estimar_lesiones_potenciales(datos_raw, score)
        cols_lesiones = st.columns(2)
        for i, (lesion, detalle) in enumerate(lesiones):
            with cols_lesiones[i % 2]:
                st.markdown(f"""
                <div class="factor-card">
                    <strong>{lesion}</strong><br>
                    <small>{detalle}</small>
                </div>
                """, unsafe_allow_html=True)

        st.divider()

        st.subheader("Resumen del perfil")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Fatiga", f"{fatiga}/10", delta="Alta" if fatiga >= 7 else "Normal", delta_color="inverse")
        col2.metric("Sueño", f"{horas_sueño}h", delta="Insuficiente" if horas_sueño < 7 else "Correcto", delta_color="inverse" if horas_sueño < 7 else "normal")
        col3.metric("Descanso", f"{dias_recup}d/sem", delta="Insuficiente" if dias_recup <= 1 else "Correcto", delta_color="inverse" if dias_recup <= 1 else "normal")
        col4.metric("Hidratación", f"{hidratacion}L", delta="Baja" if hidratacion < 2 else "Correcta", delta_color="inverse" if hidratacion < 2 else "normal")

with tab_registro:
    st.subheader("Registro")
    st.caption("Registra un día concreto o guarda varios días con la rutina actual del panel lateral.")

    modo_registro = st.radio(
        "Modo",
        ["Un día", "Rango de días"],
        index=0,
        horizontal=True,
        key="modo_registro",
    )

    datos_registro = datos_raw.copy()
    if modo_registro == "Un día":
        col_fecha, col_molestias = st.columns([1, 2])
        with col_fecha:
            fecha_registro = st.date_input("Fecha", value=date.today(), key="fecha_registro_un_dia")
        with col_molestias:
            molestias = st.text_input("Molestias o notas", placeholder="Ej.: leve molestia en rodilla...", key="molestias_un_dia")

        col1, col2, col3, col4 = st.columns(4)
        datos_registro["Fatigue_Score"] = col1.slider("Fatiga", 1, 10, fatiga, key="fatiga_un_dia")
        datos_registro["Training_Intensity"] = col2.slider("Intensidad", 1, 10, intensidad, key="intensidad_un_dia")
        datos_registro["Training_Hours_Per_Week"] = col3.slider("Horas/semana", 1, 30, horas_semana, key="horas_un_dia")
        datos_registro["Recovery_Days_Per_Week"] = col4.slider("Descanso", 0, 6, dias_recup, key="descanso_un_dia")

        col5, col6, col7, col8 = st.columns(4)
        datos_registro["sleep_hours"] = col5.slider("Sueño", 4.0, 10.0, horas_sueño, step=0.5, key="sueno_un_dia")
        datos_registro["sleep_quality"] = col6.slider("Calidad sueño", 1.0, 10.0, calidad_sueño, step=0.5, key="calidad_sueno_un_dia")
        datos_registro["hydration_liters"] = col7.slider("Hidratación", 1.0, 4.0, hidratacion, step=0.5, key="hidratacion_un_dia")
        datos_registro["meals_per_day"] = col8.slider("Comidas", 2, 6, comidas, key="comidas_un_dia")
        datos_registro["sleep_deficit"] = max(0, 7.0 - datos_registro["sleep_hours"])
        dias_a_guardar = 1
    else:
        col_inicio, col_fin = st.columns(2)
        with col_inicio:
            fecha_inicio_rango = st.date_input("Desde", value=date.today() - timedelta(days=6), key="fecha_inicio_rango")
        with col_fin:
            fecha_fin_rango = st.date_input("Hasta", value=date.today(), key="fecha_fin_rango")
        molestias = st.text_input("Notas para el rango", placeholder="Ej.: rutina estable, misma carga toda la semana...", key="molestias_rango")
        dias_a_guardar = max(0, (fecha_fin_rango - fecha_inicio_rango).days + 1)

    prob_preview, score_preview, nivel_preview, color_preview, css_preview, icono_preview = predecir_desde_datos(datos_registro)

    col_preview, col_resumen = st.columns([1, 2])
    with col_preview:
        st.plotly_chart(gauge_chart(score_preview, color_preview), use_container_width=True, key="gauge_registro_preview")
    with col_resumen:
        rango_texto = (
            f"{fecha_registro}"
            if modo_registro == "Un día"
            else f"{fecha_inicio_rango} → {fecha_fin_rango} ({dias_a_guardar} día(s))"
        )
        st.markdown(f"""
        <div class="{css_preview}">
            <h2 style="margin:0">Riesgo {nivel_preview}</h2>
            <p style="margin:8px 0 0 0; font-size:16px">
                Se guardará: <strong>{rango_texto}</strong>
            </p>
            <p style="margin:4px 0 0 0; font-size:16px">
                Score estimado: <strong>{score_preview}/100</strong> · Probabilidad: <strong>{prob_preview*100:.1f}%</strong>
            </p>
        </div>
        """, unsafe_allow_html=True)

        col_a, col_b, col_c, col_d = st.columns(4)
        col_a.metric("Fatiga", f"{datos_registro['Fatigue_Score']}/10")
        col_b.metric("Sueño", f"{datos_registro['sleep_hours']}h")
        col_c.metric("Hidratación", f"{datos_registro['hydration_liters']}L")
        col_d.metric("Intensidad", f"{datos_registro['Training_Intensity']}/10")

    if st.button("Guardar registro", type="primary", use_container_width=True):
        if modo_registro == "Un día":
            guardar_registro(crear_registro_historial(fecha_registro, datos_registro, genero_label, molestias))
            st.success(f"Registro guardado para {fecha_registro}. Si ya existía ese día, se ha actualizado.")
        elif fecha_fin_rango < fecha_inicio_rango:
            st.error("La fecha final no puede ser anterior a la fecha inicial.")
        elif dias_a_guardar > 31:
            st.error("Para la demo, el registro rápido permite un máximo de 31 días seguidos.")
        else:
            dias_guardados = guardar_rango_registros(fecha_inicio_rango, fecha_fin_rango, datos_registro, genero_label, molestias)
            st.success(f"Rango guardado correctamente: {dias_guardados} día(s). Si algún día ya existía, se ha actualizado.")
with tab_seguimiento:
    st.subheader("Seguimiento semanal/mensual")
    st.caption("Visualiza los registros diarios guardados y analiza la evolución real del riesgo.")

    col_demo1, col_demo2, col_demo3 = st.columns(3)
    if col_demo1.button("Cargar semana saludable", use_container_width=True):
        cargar_demo("saludable", datos_raw, genero_label)
        st.success("Semana saludable cargada en el historial.")
    if col_demo2.button("Cargar semana de sobrecarga", use_container_width=True):
        cargar_demo("sobrecarga", datos_raw, genero_label)
        st.success("Semana de sobrecarga cargada en el historial.")
    if col_demo3.button("Limpiar historial local", use_container_width=True):
        borrar_registros()
        st.warning("Historial local eliminado.")

    df_historial = cargar_registros()
    if df_historial.empty:
        st.info("Aún no hay registros. Guarda varios días en **Registro** o carga una semana de demo.")
    else:
        periodo = st.radio("Periodo", ["Últimos 7 días", "Últimos 30 días", "Todo el historial"], horizontal=True)
        hoy = date.today()
        if periodo == "Últimos 7 días":
            fecha_inicio = hoy - timedelta(days=6)
            df_periodo = df_historial[df_historial["Fecha"] >= fecha_inicio]
        elif periodo == "Últimos 30 días":
            fecha_inicio = hoy - timedelta(days=29)
            df_periodo = df_historial[df_historial["Fecha"] >= fecha_inicio]
        else:
            df_periodo = df_historial.copy()

        df_periodo = df_periodo.sort_values("Fecha")

        if df_periodo.empty:
            st.warning("No hay registros dentro del periodo seleccionado.")
        else:
            titulo, mensaje, tendencia_txt, media_score, dias_altos, media_sueno, media_fatiga = valorar_seguimiento(df_periodo)

            col1, col2, col3, col4 = st.columns(4)
            col1.markdown(f"""<div class="metric-card"><small>Riesgo medio</small><h3>{media_score:.0f}/100</h3></div>""", unsafe_allow_html=True)
            col2.markdown(f"""<div class="metric-card"><small>Días en riesgo alto</small><h3>{dias_altos}</h3></div>""", unsafe_allow_html=True)
            col3.markdown(f"""<div class="metric-card"><small>Sueño medio</small><h3>{media_sueno:.1f}h</h3></div>""", unsafe_allow_html=True)
            col4.markdown(f"""<div class="metric-card"><small>Fatiga media</small><h3>{media_fatiga:.1f}/10</h3></div>""", unsafe_allow_html=True)

            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=df_periodo["Fecha"],
                y=df_periodo["Score"],
                mode="lines+markers",
                name="Score de riesgo",
                line=dict(color="#e74c3c", width=3),
                marker=dict(size=8),
            ))
            fig.add_hrect(y0=0, y1=20, fillcolor="#d5f5e3", opacity=0.35, line_width=0)
            fig.add_hrect(y0=20, y1=50, fillcolor="#fef9e7", opacity=0.35, line_width=0)
            fig.add_hrect(y0=50, y1=100, fillcolor="#fadbd8", opacity=0.35, line_width=0)
            fig.update_layout(
                height=360,
                yaxis=dict(range=[0, 100], title="Score de riesgo"),
                xaxis=dict(title="Fecha"),
                margin=dict(t=30, b=20, l=20, r=20),
            )
            st.plotly_chart(fig, use_container_width=True, key="grafico_score_periodo")

            fig_habitos = go.Figure()
            fig_habitos.add_trace(go.Scatter(x=df_periodo["Fecha"], y=df_periodo["Fatiga"], mode="lines+markers", name="Fatiga"))
            fig_habitos.add_trace(go.Scatter(x=df_periodo["Fecha"], y=df_periodo["Sueño"], mode="lines+markers", name="Sueño"))
            fig_habitos.add_trace(go.Scatter(x=df_periodo["Fecha"], y=df_periodo["Hidratación"], mode="lines+markers", name="Hidratación"))
            fig_habitos.update_layout(height=320, yaxis=dict(title="Valor registrado"), xaxis=dict(title="Fecha"), margin=dict(t=30, b=20, l=20, r=20))
            st.plotly_chart(fig_habitos, use_container_width=True, key="grafico_habitos_periodo")

            alertas = generar_alertas_periodo(df_periodo)
            if alertas:
                st.subheader("Alertas del periodo")
                for alerta in alertas:
                    st.markdown(f"""<div class="alerta-card">{alerta}</div>""", unsafe_allow_html=True)

            st.markdown(f"""
            <div class="recomendacion">
                <strong>{titulo}</strong><br>
                La tendencia {tendencia_txt}. {mensaje}
            </div>
            """, unsafe_allow_html=True)

            ultimo_registro = df_periodo.iloc[-1]
            st.subheader("Lectura médico-deportiva del último registro")
            col_rec, col_les, col_eff = st.columns(3)
            with col_rec:
                st.markdown("**Recomendaciones**")
                for item in str(ultimo_registro.get("Recomendaciones", "")).split(" | "):
                    if item:
                        st.markdown(f"""<div class="recomendacion">{item}</div>""", unsafe_allow_html=True)
            with col_les:
                st.markdown("**Posibles lesiones asociadas**")
                for item in str(ultimo_registro.get("Posibles lesiones", "")).split(" | "):
                    if item:
                        st.markdown(f"""<div class="factor-card"><strong>{item}</strong></div>""", unsafe_allow_html=True)
            with col_eff:
                st.markdown("**Efectos negativos a vigilar**")
                for item in str(ultimo_registro.get("Efectos negativos", "")).split(" | "):
                    if item:
                        st.markdown(f"""<div class="alerta-card">{item}</div>""", unsafe_allow_html=True)

            st.subheader("Detalle diario")
            columnas = [
                "Fecha", "Score", "Nivel", "Fatiga", "Sueño", "Hidratación",
                "Intensidad", "Descanso", "Molestias", "Posibles lesiones",
                "Efectos negativos",
            ]
            st.dataframe(df_periodo[columnas], use_container_width=True, hide_index=True)

    st.caption("Este sistema es una herramienta de apoyo basada en datos. No sustituye el criterio de un profesional médico o preparador físico.")
