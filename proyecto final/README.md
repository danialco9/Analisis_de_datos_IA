# Sistema Inteligente de Prediccion de Riesgo de Lesion Deportiva

Aplicacion interactiva en Streamlit para estimar y monitorizar el riesgo de lesion en deportistas amateurs a partir de datos de entrenamiento, recuperacion, sueno, nutricion e hidratacion.

El proyecto combina un modelo de Machine Learning entrenado previamente con una capa de interpretacion medico-deportiva para que el resultado sea comprensible y util en una demo de defensa.

## Demo rapida

```bash
pip install -r requirements.txt
python -m streamlit run app/app.py --browser.gatherUsageStats=false
```

Abrir:

```text
http://localhost:8501
```

## Funcionalidades principales

### Prediccion individual

El usuario introduce datos del atleta en el panel lateral:

- Perfil: edad, genero, altura y peso.
- Deporte y posicion.
- Carga de entrenamiento.
- Descanso y eventos.
- Fatiga, rendimiento, equilibrio de carga y score ACL.
- Sueno.
- Nutricion e hidratacion.

La app genera:

- Probabilidad estimada de lesion.
- Score de riesgo de 0 a 100.
- Clasificacion: BAJO, MEDIO o ALTO.
- Factores principales de riesgo.
- Recomendaciones personalizadas.
- Posibles lesiones asociadas.

### Registro diario

Permite guardar el estado de un dia concreto:

- Fecha.
- Fatiga.
- Intensidad.
- Horas semanales.
- Descanso.
- Sueno.
- Calidad del sueno.
- Hidratacion.
- Comidas.
- Molestias o notas.

Antes de guardar, la app muestra una vista previa del riesgo estimado.

### Registro por rango

Permite guardar varios dias seguidos con la misma rutina. Es util cuando el deportista ha mantenido una semana o periodo similar y se quiere registrar rapidamente.

El rango esta limitado a 31 dias para mantener la demo controlada.

### Seguimiento semanal/mensual

El historial permite analizar:

- Ultimos 7 dias.
- Ultimos 30 dias.
- Todo el historial.

La app muestra:

- Riesgo medio.
- Dias en riesgo alto.
- Sueno medio.
- Fatiga media.
- Grafica de evolucion del score.
- Grafica de habitos: fatiga, sueno e hidratacion.
- Alertas automaticas.
- Lectura medico-deportiva del ultimo registro.
- Tabla diaria con posibles lesiones y efectos negativos.
- Descarga de informe Excel con resumen, historial, recomendaciones y graficas.

Incluye botones para cargar una semana saludable o una semana de sobrecarga, pensados para facilitar la presentacion en defensa.

## Estructura

```text
proyecto final/
├── app/
│   └── app.py                  # Aplicacion Streamlit
├── data/
│   ├── raw/                    # Dataset original, no modificar
│   └── processed/              # Datasets procesados, graficos e historial local
├── docs/                       # Documentacion, guion y validacion
├── models/                     # Modelos serializados
│   ├── mejor_modelo.pkl        # XGBoost, modelo elegido
│   ├── scaler.pkl              # StandardScaler
│   └── feature_columns.pkl     # Lista de las 23 features
├── notebooks/
│   ├── 01_EDA.ipynb            # Analisis exploratorio
│   ├── 02_Features.ipynb       # Feature engineering y SMOTE
│   └── 03_Modelos.ipynb        # Entrenamiento y comparacion de modelos
└── requirements.txt
```

## Historial local

Los registros diarios se guardan en:

```text
data/processed/seguimiento_atleta.csv
```

Este archivo esta ignorado por Git para evitar subir datos personales o registros generados durante pruebas.

## Modelos entrenados

| Modelo | Accuracy | ROC-AUC |
|---|---:|---:|
| Regresion Logistica | 93.3% | 0.997 |
| Random Forest | 97.3% | 1.000 |
| XGBoost | 96.0% | 0.999 |
| Ensemble | 96.0% | 0.999 |

El modelo activo de la app es XGBoost.

## Dataset

Dataset original:

```text
collegiate_athlete_injury_dataset.csv
```

Caracteristicas:

- 200 atletas universitarios.
- 17 columnas originales.
- Sin valores nulos.
- Variable objetivo: `Injury_Indicator`.
- Desbalance original aproximado 13:1.
- Correccion del desbalance mediante SMOTE.
- Incorporacion de variables sinteticas de sueno y nutricion.

## Deportes soportados

- Baloncesto.
- Futbol.
- Futbol Americano.
- Voley.
- Atletismo.
- Natacion.
- Tenis.
- Gym / Musculacion.
- Otro deporte.

## Limitaciones

- El sistema no sustituye una valoracion medica profesional.
- El dataset original es pequeno.
- Las variables de sueno y nutricion son sinteticas.
- El seguimiento es local, no multiusuario.
- No se calcula ACWR real porque no hay series temporales reales del dataset original.
- Las posibles lesiones y efectos negativos son orientativos.

## Requisitos

Python 3.10 o superior.

Ver dependencias en:

```text
requirements.txt
```
