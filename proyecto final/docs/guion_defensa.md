# Guion de Defensa

## Objetivo de la presentacion

Mostrar un producto funcionando que predice y monitoriza el riesgo de lesion en deportistas amateurs.

La defensa debe explicar con criterio:

- Que problema resuelve.
- Quien lo usaria.
- Que datos necesita.
- Como transforma esos datos.
- Que resultado entrega.
- Como permite hacer seguimiento.
- Que valor aporta.
- Que limitaciones tiene.
- Como podria evolucionar.

La defensa debe centrarse en la demo y en la utilidad del sistema, no en explicar codigo linea por linea.

## 1. Apertura

Este proyecto consiste en un sistema inteligente de prediccion y seguimiento del riesgo de lesion para deportistas amateurs.

El objetivo es ayudar a detectar situaciones de riesgo antes de que aparezca una lesion, usando datos sencillos que un deportista o entrenador puede registrar: carga de entrenamiento, descanso, fatiga, sueno, hidratacion, nutricion y estado fisico.

La salida principal es un score de riesgo de 0 a 100, una clasificacion bajo/medio/alto, factores de riesgo detectados, recomendaciones personalizadas, posibles lesiones asociadas y efectos negativos a vigilar.

## 2. Problema y oportunidad

Muchos deportistas amateurs entrenan con poca planificacion y sin control objetivo de su carga.

El problema es que suelen tomar decisiones tarde: cuando ya hay dolor, fatiga excesiva o lesion.

Este sistema intenta aportar una herramienta preventiva:

- Facilita interpretar el estado del deportista.
- Convierte datos simples en una alerta comprensible.
- Permite registrar la evolucion diaria.
- Ayuda a detectar tendencias de fatiga o sobrecarga.
- Puede apoyar a entrenadores, preparadores fisicos, fisioterapeutas o deportistas.

## 3. Usuario objetivo

El usuario principal es un deportista amateur o semiprofesional que entrena varias veces por semana.

Tambien podria usarlo:

- Un entrenador.
- Un preparador fisico.
- Un fisioterapeuta como apoyo inicial.
- Un club deportivo con seguimiento basico de deportistas.

La herramienta no sustituye una valoracion medica, pero puede ayudar a decidir cuando conviene reducir carga, descansar o consultar a un profesional.

## 4. Demo funcional

Abrir la aplicacion:

```text
http://localhost:8501
```

### Paso 1: Panel de entrada

Mostrar el panel lateral y explicar:

El sistema pide datos del atleta:

- Perfil: edad, genero, altura, peso.
- Deporte y posicion.
- Entrenamiento: intensidad, horas semanales, descanso y eventos.
- Estado fisico: fatiga, rendimiento, contribucion, equilibrio de carga, score ACL.
- Sueno.
- Nutricion e hidratacion.

Estos datos se transforman en las 23 variables que espera el modelo.

### Paso 2: Prediccion individual

Entrar en la pestana `Prediccion individual`.

Mostrar un perfil sano:

- Intensidad moderada.
- Buen descanso.
- Baja fatiga.
- Sueno correcto.
- Hidratacion correcta.

Explicar:

El sistema devuelve un score bajo porque no hay senales criticas. Ademas de la clasificacion, muestra factores de riesgo, recomendaciones y posibles lesiones asociadas.

Despues mostrar un perfil de carga alta:

- Intensidad 8-9.
- Muchas horas de entrenamiento.
- Pocos dias de descanso.
- Fatiga alta.
- Poco sueno.
- Hidratacion baja.

Explicar:

El score sube porque se combinan varios factores de riesgo: fatiga, poca recuperacion, alta carga y mal descanso. La salida debe interpretarse como alerta preventiva, no como diagnostico.

### Paso 3: Registro diario

Entrar en la pestana `Registro`.

Explicar:

La app permite registrar un dia concreto. Antes de guardar, calcula una vista previa del riesgo estimado para ese dia.

Datos que se pueden ajustar:

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

Al guardar, el registro queda en un historial local. Si la fecha ya existia, se actualiza.

### Paso 4: Registro por rango

En la misma pestana `Registro`, seleccionar `Rango de dias`.

Explicar:

Este modo permite guardar varios dias seguidos con una misma rutina. Es util cuando el deportista ha hecho una semana muy parecida y no quiere introducir cada dia manualmente.

El usuario selecciona:

- Fecha inicial.
- Fecha final.
- Notas del periodo.

La app guarda todos los dias del rango con la rutina configurada.

### Paso 5: Seguimiento semanal/mensual

Entrar en `Seguimiento semanal/mensual`.

Mostrar:

- Ultimos 7 dias.
- Ultimos 30 dias.
- Todo el historial.

Explicar que la app muestra:

- Riesgo medio.
- Dias en riesgo alto.
- Sueno medio.
- Fatiga media.
- Grafica de evolucion del score.
- Grafica de habitos: fatiga, sueno e hidratacion.
- Alertas automaticas.
- Lectura medico-deportiva del ultimo registro.
- Tabla con posibles lesiones y efectos negativos.

Para acelerar la defensa, usar los botones:

- `Cargar semana saludable`.
- `Cargar semana de sobrecarga`.

Comparar ambas situaciones para mostrar como cambia el comportamiento del sistema.

## 5. Flujo funcional del sistema

El flujo del MVP sigue esta logica:

1. El usuario introduce datos personales y deportivos.
2. El sistema transforma esos datos en features.
3. Se aplica el scaler usado durante el entrenamiento.
4. El modelo XGBoost estima la probabilidad de lesion.
5. Se calcula un score final de 0 a 100 combinando modelo y factores medico-deportivos.
6. Se clasifica el riesgo como bajo, medio o alto.
7. Se muestran factores criticos, recomendaciones, posibles lesiones y efectos negativos.
8. El usuario puede guardar registros diarios o rangos de dias.
9. El sistema analiza la evolucion semanal/mensual mediante graficas y alertas.

## 6. Datos utilizados

El proyecto parte de un dataset publico de atletas universitarios.

Caracteristicas principales:

- 200 registros.
- 17 columnas originales.
- Sin valores nulos.
- Variable objetivo: `Injury_Indicator`.
- Score continuo: `ACL_Risk_Score`.

El dataset original estaba desbalanceado: habia muchos mas casos sin lesion que con lesion.

Para entrenar los modelos se aplico:

- Exploracion de datos.
- Encoding de variables categoricas.
- Features sinteticas de sueno y nutricion.
- Correccion del desbalance con SMOTE.
- Normalizacion con StandardScaler.
- Division train / validation / test.

El seguimiento diario de la app se guarda en un CSV local generado por la propia aplicacion. Ese historial no forma parte del dataset original de entrenamiento.

## 7. Modelos y resultados

Se compararon varios modelos:

| Modelo | Accuracy | ROC-AUC |
|---|---:|---:|
| Regresion Logistica | 93.3% | 0.997 |
| Random Forest | 97.3% | 1.000 |
| XGBoost | 96.0% | 0.999 |
| Ensemble | 96.0% | 0.999 |

El modelo activo de la app es XGBoost.

Se eligio porque ofrece buen rendimiento y se integra bien en la demo.

## 8. Como interpretar la salida

La salida no debe interpretarse como diagnostico medico.

Debe entenderse como una alerta preventiva:

- Riesgo bajo: el perfil no muestra senales criticas.
- Riesgo medio: hay factores que conviene vigilar.
- Riesgo alto: se recomienda revisar carga, descanso y consultar a un profesional si hay molestias o fatiga persistente.

Las posibles lesiones asociadas indican areas de atencion, no lesiones garantizadas. Los efectos negativos ayudan a entender consecuencias probables de mantener malos habitos de carga, sueno, hidratacion o descanso.

## 9. Valor del producto

El valor principal es convertir datos dispersos en una decision sencilla y accionable.

El usuario no recibe solo un numero, sino:

- Un score visual.
- Una clasificacion facil de entender.
- Factores que explican el resultado.
- Recomendaciones accionables.
- Posibles zonas o lesiones a vigilar.
- Efectos negativos derivados de la carga o mala recuperacion.
- Evolucion semanal o mensual del riesgo.

Esto puede ayudar a prevenir lesiones y mejorar la planificacion del entrenamiento.

## 10. Limitaciones

Limitaciones que hay que explicar con claridad:

- El dataset es pequeno.
- Los datos proceden de atletas universitarios, no de todos los perfiles deportivos.
- Las variables de sueno y nutricion son sinteticas.
- El historial de seguimiento es local y no multiusuario.
- No hay series temporales reales del dataset original, por lo que no se calcula ACWR real.
- El sistema no sustituye a un medico, fisioterapeuta o preparador fisico.
- Las lesiones asociadas y efectos negativos son orientativos.

## 11. Siguientes pasos

Con mas tiempo, el sistema podria evolucionar hacia:

- Registro diario real por usuario autenticado.
- Historial individual persistente en base de datos.
- Graficas de tendencia mas avanzadas.
- Calculo real de ACWR con series temporales.
- Integracion con wearables.
- Dataset mas grande y especifico por deporte.
- Validacion con profesionales de medicina deportiva.
- Sistema de alertas automaticas.

## 12. Preguntas probables y respuestas

### Que problema exacto resuelve?

Ayuda a detectar perfiles y tendencias de riesgo de lesion antes de que el problema aparezca, usando datos de carga, descanso, fatiga y recuperacion.

### Quien lo usaria?

Deportistas amateurs, entrenadores, preparadores fisicos o clubes con seguimiento basico de deportistas.

### Que datos necesita?

Datos personales, entrenamiento semanal, descanso, fatiga, rendimiento, sueno, hidratacion, nutricion basica y, si se usa el seguimiento, registros diarios.

### Como se interpretan los resultados?

Como una herramienta preventiva. El score indica nivel de riesgo y las recomendaciones ayudan a tomar decisiones sobre carga, descanso o consulta profesional.

### Por que no es diagnostico medico?

Porque el sistema trabaja con datos generales y un modelo estadistico. No explora al deportista ni sustituye pruebas clinicas.

### Que aporta el seguimiento frente a una prediccion puntual?

Permite ver si el riesgo se mantiene estable, mejora o empeora durante una semana o un mes. Esto se parece mas a un uso real de la herramienta.

### Que mejorarias con un mes mas?

Anadir historico por usuario, calcular ACWR real, mejorar visualizaciones, ampliar dataset y validar recomendaciones con profesionales de medicina deportiva.

## 13. Cierre

Como conclusion, el proyecto demuestra un MVP funcional capaz de transformar datos deportivos basicos en una prediccion interpretable y en un seguimiento preventivo del riesgo de lesion.

El valor no esta solo en el modelo, sino en presentar la informacion de forma comprensible para que el usuario pueda actuar: descansar, ajustar carga, hidratarse mejor o consultar a un profesional cuando el perfil lo requiera.
