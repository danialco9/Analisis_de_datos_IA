# Validacion de la App Streamlit

## Objetivo

Validar que la aplicacion Streamlit carga correctamente los artefactos del modelo, permite evaluar el riesgo de lesion de un deportista amateur y ofrece un flujo completo de seguimiento preventivo.

La validacion se centra en comprobar:

- Carga del modelo entrenado.
- Carga del scaler y columnas esperadas.
- Generacion del score de riesgo de 0 a 100.
- Clasificacion en riesgo bajo, medio o alto.
- Identificacion de factores de riesgo.
- Generacion de recomendaciones medico-deportivas.
- Visualizacion de posibles lesiones asociadas.
- Registro diario y por rango de dias.
- Seguimiento semanal/mensual con graficas, alertas y lectura medico-deportiva.
- Exportacion del historial a Excel con resumen, recomendaciones y graficas.

## Entorno de prueba

- Aplicacion: `app/app.py`
- Framework: Streamlit
- Modelo activo: XGBoost
- Archivo del modelo: `models/mejor_modelo.pkl`
- Scaler: `models/scaler.pkl`
- Columnas: `models/feature_columns.pkl`
- Numero de features: 23
- Historial local: `data/processed/seguimiento_atleta.csv`

La aplicacion fue ejecutada localmente en:

```text
http://localhost:8501
```

El archivo de historial se genera localmente por la app y esta ignorado por Git para evitar subir registros personales.

## Comprobacion tecnica

Resultado de la prueba interna:

- El servidor Streamlit arranca correctamente.
- El modelo XGBoost carga sin errores.
- El scaler carga sin errores.
- Las 23 features esperadas cargan correctamente.
- La funcion de prediccion devuelve probabilidades validas.
- La app genera score, nivel de riesgo, factores, recomendaciones, posibles lesiones y efectos negativos.
- El registro diario guarda datos en CSV local.
- El registro por rango permite guardar varios dias con la misma rutina.
- El seguimiento filtra ultimos 7 dias, ultimos 30 dias o todo el historial.
- La descarga Excel genera un archivo `.xlsx` con historial completo, periodo seleccionado, recomendaciones y graficas.

## Flujos validados

### Flujo 1: Prediccion individual

El usuario introduce datos del atleta en el panel lateral:

- Perfil: edad, genero, altura, peso.
- Deporte y posicion.
- Entrenamiento: intensidad, horas semanales, descanso y eventos.
- Estado fisico: fatiga, rendimiento, contribucion, equilibrio de carga y score ACL.
- Sueno, nutricion e hidratacion.

La app calcula:

- Probabilidad estimada de lesion.
- Score de riesgo 0-100.
- Nivel bajo, medio o alto.
- Factores principales de riesgo.
- Recomendaciones personalizadas.
- Posibles lesiones asociadas.

### Flujo 2: Registro diario

Se valido el registro de un dia concreto.

El usuario selecciona una fecha y ajusta:

- Fatiga.
- Intensidad.
- Horas semanales.
- Dias de descanso.
- Sueno.
- Calidad del sueno.
- Hidratacion.
- Comidas.
- Molestias o notas.

Antes de guardar, la app muestra una vista previa con el riesgo estimado. Al guardar, el registro queda almacenado en `seguimiento_atleta.csv`. Si ya existe un registro con la misma fecha, se actualiza en vez de duplicarse.

### Flujo 3: Registro por rango de dias

Se valido el registro rapido de varios dias.

El usuario selecciona:

- Fecha inicial.
- Fecha final.
- Notas del periodo.

La app guarda todos los dias del rango con la rutina configurada. Para la demo, el limite se fija en 31 dias consecutivos.

### Flujo 4: Seguimiento semanal/mensual

Se valido la visualizacion del historial con tres modos:

- Ultimos 7 dias.
- Ultimos 30 dias.
- Todo el historial.

La app muestra:

- Riesgo medio del periodo.
- Dias en riesgo alto.
- Sueno medio.
- Fatiga media.
- Grafica de evolucion del score.
- Grafica de habitos: fatiga, sueno e hidratacion.
- Alertas automaticas.
- Lectura medico-deportiva del ultimo registro.
- Tabla diaria con score, nivel, molestias, posibles lesiones y efectos negativos.
- Boton de descarga Excel para exportar el seguimiento completo.

## Casos de prueba

### Caso 1: Perfil sano / riesgo bajo

**Entrada simulada**

| Variable | Valor |
|---|---:|
| Deporte | Voley |
| Posicion | Colocador/a |
| Intensidad | 4/10 |
| Horas de entrenamiento | 5 h/semana |
| Dias de descanso | 3 dias/semana |
| Eventos por semana | 1 |
| Dias entre eventos | 3 |
| Fatiga | 3/10 |
| Score ACL | 25/100 |
| Sueno | 8 h |
| Hidratacion | 2.5 L/dia |
| Comidas | 4/dia |

**Resultado esperado**

- Riesgo bajo.
- Sin senales criticas destacadas.
- Recomendacion de mantener habitos y seguir monitorizando.

### Caso 2: Carga alta / recuperacion baja

**Entrada simulada**

| Variable | Valor |
|---|---:|
| Deporte | Futbol |
| Posicion | Delantero |
| Intensidad | 8/10 |
| Horas de entrenamiento | 12 h/semana |
| Dias de descanso | 1 dia/semana |
| Eventos por semana | 3 |
| Dias entre eventos | 1 |
| Fatiga | 8/10 |
| Score ACL | 55/100 |
| Sueno | 6 h |
| Hidratacion | 1.5 L/dia |
| Comidas | 3/dia |

**Resultado esperado**

- Riesgo alto o moderado-alto segun combinacion de variables.
- Factores principales: fatiga elevada, intensidad alta y recuperacion insuficiente.
- Posibles lesiones: rodilla/LCA, sobrecarga muscular, tendinopatias y zonas asociadas al deporte.
- Efectos negativos: fatiga acumulada, peor recuperacion, mayor estres articular y muscular.

### Caso 3: Seguimiento de sobrecarga

Se cargo una semana de sobrecarga desde el boton de demo.

**Resultado esperado**

- Varios dias con riesgo alto.
- Alertas automaticas por fatiga, descanso insuficiente o sueno bajo.
- Grafica de riesgo con tendencia creciente o mantenida en zona alta.
- Recomendaciones orientadas a descarga, mejora del descanso e intervencion profesional si procede.

## Conclusion

La aplicacion cumple los objetivos de la fase B6. Permite evaluar un perfil puntual y, ademas, registrar la evolucion de un deportista durante varios dias para analizar tendencias preventivas.

La validacion confirma que:

- La app funciona localmente.
- Los artefactos del modelo se cargan correctamente.
- El flujo de entrada, prediccion y salida es completo.
- Los resultados son coherentes para perfiles de bajo y alto riesgo.
- El registro diario y por rango permite simular un uso real.
- El seguimiento semanal/mensual aporta valor para la defensa.
- Las recomendaciones, posibles lesiones y efectos negativos ayudan a interpretar el resultado.

## Limitaciones

- El sistema no sustituye una valoracion medica profesional.
- El dataset original es pequeno.
- Las variables de sueno y nutricion son sinteticas.
- El historial local no equivale a una base de datos multiusuario.
- No hay series temporales reales del entrenamiento original, por lo que no se calcula ACWR real.
- Las lesiones asociadas son orientativas y se basan en factores de riesgo, no en diagnostico clinico.

## Estado

Fase B6 completada: testing y validacion de la aplicacion.
