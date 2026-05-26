# Sistema Inteligente de Predicción de Riesgo de Lesión Deportiva

Demo interactiva en Streamlit que predice el riesgo de lesión de un deportista amateur a partir de sus datos de entrenamiento, recuperación, sueño y nutrición.

---

## Demo rápida

```bash
pip install -r requirements.txt
streamlit run app/app.py
```

Abre **http://localhost:8501**, rellena los datos del atleta y pulsa **Predecir Riesgo**.

---

## Qué hace

1. El usuario introduce sus datos en el panel lateral (perfil, entrenamiento, sueño, nutrición)
2. El sistema construye un vector de **23 features** automáticamente
3. Un modelo **XGBoost** (Accuracy 96%, ROC-AUC 0.999) predice la probabilidad de lesión
4. Se muestra un **score 0-100** con clasificación **BAJO / MEDIO / ALTO**, los principales factores de riesgo detectados y recomendaciones personalizadas

---

## Estructura

```
proyecto final/
├── app/
│   └── app.py                  # Demo Streamlit
├── data/
│   ├── raw/                    # Dataset original (no modificar)
│   └── processed/              # Datasets procesados + gráficos EDA
├── docs/                       # PDFs de planificación y guía de presentación
├── models/                     # Modelos serializados (.pkl)
│   ├── mejor_modelo.pkl        # XGBoost (modelo elegido)
│   ├── scaler.pkl              # StandardScaler
│   └── feature_columns.pkl     # Lista de las 23 features
├── notebooks/
│   ├── 01_EDA.ipynb            # Análisis exploratorio
│   ├── 02_Features.ipynb       # Feature engineering + SMOTE
│   └── 03_Modelos.ipynb        # Entrenamiento y comparación de modelos
└── requirements.txt
```

---

## Modelos entrenados

| Modelo | Accuracy | ROC-AUC |
|---|---|---|
| Regresión Logística | 93.3% | 0.997 |
| Random Forest | 97.3% | 1.000 |
| **XGBoost** ✓ | **96.0%** | **0.999** |
| Ensemble (Voting) | 96.0% | 0.999 |

---

## Dataset

`collegiate_athlete_injury_dataset.csv` — 200 atletas universitarios, 17 columnas, sin valores nulos.  
Desbalance original 13:1 (lesión vs no lesión) corregido con **SMOTE**.  
Se añadieron 5 **features sintéticas** de sueño y nutrición con correlaciones realistas basadas en literatura científica (OMS, ACSM).

---

## Deportes soportados

Baloncesto · Fútbol · Fútbol Americano · Atletismo · Natación · Tenis · Gym/Musculación · Otro

---

## Requisitos

Python 3.10+ — ver `requirements.txt`
