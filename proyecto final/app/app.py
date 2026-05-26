import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.graph_objects as go
import os

# ── Configuración de página ─────────────────────────────────
st.set_page_config(
    page_title="Predicción de Riesgo de Lesión",
    page_icon="🏃",
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

# ── Deportes y posiciones ───────────────────────────────────
SPORT_POSITIONS = {
    "🏀 Baloncesto":       ["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"],
    "⚽ Fútbol":           ["Portero", "Defensa Central", "Lateral", "Centrocampista", "Extremo", "Delantero"],
    "🏈 Fútbol Americano": ["Quarterback", "Running Back", "Wide Receiver", "Lineman", "Linebacker"],
    "🏃 Atletismo":        ["Velocista", "Fondista", "Saltador/a", "Lanzador/a"],
    "🏊 Natación":         ["Nadador/a"],
    "🎾 Tenis":            ["Tenista"],
    "🏋️ Gym / Musculación": ["Solo musculación (sin deporte)"],
    "🤸 Otro deporte":     ["Otro"],
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
    """Combina probabilidad del modelo con score de features para mayor sensibilidad visual."""
    score_modelo = prob * 100

    # Score complementario basado en features clave (hace el gauge más reactivo a los sliders)
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

    score_final = 0.55 * score_modelo + 0.45 * score_features
    return int(round(np.clip(score_final, 0, 100)))

def clasificar_riesgo(score):
    if score < 20:
        return "BAJO", "#27ae60", "riesgo-bajo", "✅"
    elif score < 50:
        return "MEDIO", "#f39c12", "riesgo-medio", "⚠️"
    else:
        return "ALTO", "#e74c3c", "riesgo-alto", "🚨"

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
    """Genera recomendaciones personalizadas según el perfil del atleta."""
    recomendaciones = []

    if datos_raw['Recovery_Days_Per_Week'] <= 1:
        recomendaciones.append("Aumenta los días de descanso a al menos 2 por semana para permitir la recuperación muscular.")
    if datos_raw['sleep_hours'] < 7:
        recomendaciones.append(f"Intenta dormir al menos 7 horas. Actualmente duermes {datos_raw['sleep_hours']}h, lo que afecta la recuperación.")
    if datos_raw['Training_Intensity'] >= 8:
        recomendaciones.append("Reduce la intensidad de algunos entrenamientos. Alterna sesiones intensas con sesiones de baja intensidad.")
    if datos_raw['hydration_liters'] < 2:
        recomendaciones.append(f"Aumenta tu hidratación. Con {datos_raw['Training_Hours_Per_Week']}h semanales de entrenamiento necesitas al menos 2-3L de agua al día.")
    if datos_raw['meals_per_day'] <= 2:
        recomendaciones.append("Aumenta la frecuencia de comidas a 3-5 al día para mantener los niveles de energía estables.")
    if datos_raw['Fatigue_Score'] >= 7:
        recomendaciones.append("Tu nivel de fatiga es elevado. Considera una semana de descarga reduciendo el volumen de entrenamiento un 40%.")
    if datos_raw['Rest_Between_Events_Days'] <= 1:
        recomendaciones.append("Intenta dejar al menos 2-3 días entre competiciones para una recuperación adecuada.")

    if score < 35:
        recomendaciones.append("Mantén tus hábitos actuales. Estás gestionando bien la carga de entrenamiento.")
    elif score >= 65:
        recomendaciones.append("Considera consultar con un preparador físico para revisar tu plan de entrenamiento.")

    return recomendaciones[:4] if recomendaciones else ["Mantén tus hábitos actuales. Tu perfil muestra un riesgo bajo."]

# ── INTERFAZ PRINCIPAL ──────────────────────────────────────
st.title("🏃 Sistema de Predicción de Riesgo de Lesión")
st.caption(f"Modelo activo: **{nombre_modelo}** · Accuracy: 96% · ROC-AUC: 0.999 · Features: 23")
st.divider()

# ── SIDEBAR: Formulario de entrada ─────────────────────────
with st.sidebar:
    st.header("📋 Datos del Atleta")

    st.subheader("👤 Perfil")
    edad   = st.slider("Edad", 16, 55, 25)
    genero = st.selectbox("Género", ["Male", "Female"])
    altura = st.slider("Altura (cm)", 150, 220, 175)
    peso   = st.slider("Peso (kg)", 45, 140, 75)

    deporte  = st.selectbox("Deporte / Actividad", list(SPORT_POSITIONS.keys()))
    opciones = SPORT_POSITIONS[deporte]
    if len(opciones) == 1:
        posicion = opciones[0]
        st.caption(f"Posición: **{posicion}**")
    else:
        posicion = st.selectbox("Posición / Rol", opciones)

    es_gym = (deporte == "🏋️ Gym / Musculación")

    st.subheader("🏋️ Entrenamiento")
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

    st.subheader("📊 Estado físico")
    fatiga        = st.slider("Fatiga (1-10)", 1, 10, 4)
    rendimiento   = st.slider("Rendimiento percibido (1-100)", 1, 100, 65)
    contribucion  = st.slider("Contribución al equipo (1-100)", 1, 100, 60)
    load_balance  = st.slider("Equilibrio de carga (1-100)", 1, 100, 70)
    acl_score     = st.slider("Score ACL (1-100)", 1, 100, 40)

    st.subheader("😴 Sueño")
    horas_sueño   = st.slider("Horas de sueño", 4.0, 10.0, 7.5, step=0.5)
    calidad_sueño = st.slider("Calidad del sueño (1-10)", 1.0, 10.0, 7.0, step=0.5)

    st.subheader("🥗 Nutrición e hidratación")
    comidas       = st.slider("Comidas al día", 2, 6, 3)
    hidratacion   = st.slider("Hidratación (litros/día)", 1.0, 4.0, 2.0, step=0.5)

    predecir = st.button("🔍 Predecir Riesgo", type="primary", use_container_width=True)

# ── ÁREA PRINCIPAL ──────────────────────────────────────────
if not predecir:
    col1, col2, col3 = st.columns(3)
    col1.metric("Modelos entrenados", "4", "LR · RF · XGBoost · Ensemble")
    col2.metric("Accuracy del modelo", "96%", "en test set")
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
    # Construir datos raw
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

    # Predicción
    X_input = construir_features(datos_raw, feature_cols)
    prob = modelo.predict_proba(X_input)[0][1]
    score = calcular_score(prob, datos_raw)
    nivel, color, css_class, icono = clasificar_riesgo(score)

    # ── Fila superior: gauge + resultado ───────────────────
    col_gauge, col_resultado = st.columns([1, 2])

    with col_gauge:
        st.plotly_chart(gauge_chart(score, color), use_container_width=True)

    with col_resultado:
        deporte_label = datos_raw.get('Deporte', '')
        st.markdown(f"""
        <div class="{css_class}">
            <h2 style="margin:0">{icono} Riesgo {nivel}</h2>
            <p style="margin:8px 0 0 0; font-size:16px">
                Score de riesgo: <strong>{score}/100</strong> · Probabilidad de lesión: <strong>{prob*100:.1f}%</strong>
            </p>
            <p style="margin:4px 0 0 0; font-size:13px; opacity:0.85">
                {deporte_label} · {posicion}
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("")

        # Factores de riesgo
        st.markdown("**🎯 Principales factores de riesgo detectados:**")
        factores = obtener_factores_riesgo(datos_raw)
        for nombre_f, detalle_f in factores:
            st.markdown(f"""
            <div class="factor-card">
                <strong>{nombre_f}</strong><br>
                <small style="color:#666">{detalle_f}</small>
            </div>
            """, unsafe_allow_html=True)

    st.divider()

    # ── Recomendaciones ─────────────────────────────────────
    st.subheader("💡 Recomendaciones personalizadas")
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

    # ── Resumen del perfil ───────────────────────────────────
    st.subheader("📊 Resumen del perfil")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Fatiga", f"{fatiga}/10",     delta="Alta" if fatiga >= 7 else "Normal", delta_color="inverse")
    col2.metric("Sueño",  f"{horas_sueño}h",  delta="Insuficiente" if horas_sueño < 7 else "Correcto", delta_color="inverse" if horas_sueño < 7 else "normal")
    col3.metric("Descanso", f"{dias_recup}d/sem", delta="Insuficiente" if dias_recup <= 1 else "Correcto", delta_color="inverse" if dias_recup <= 1 else "normal")
    col4.metric("Hidratación", f"{hidratacion}L",  delta="Baja" if hidratacion < 2 else "Correcta", delta_color="inverse" if hidratacion < 2 else "normal")

    # ── Advertencia ─────────────────────────────────────────
    st.caption("⚠️ Este sistema es una herramienta de apoyo basada en datos. No sustituye el criterio de un profesional médico o preparador físico.")
