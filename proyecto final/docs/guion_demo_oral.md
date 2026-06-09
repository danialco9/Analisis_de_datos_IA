# Guion oral de la demo

Duracion orientativa: 8-10 minutos.

## 1. Apertura

Buenos dias. Mi proyecto es un sistema inteligente para predecir y hacer seguimiento del riesgo de lesion en deportistas amateurs.

La idea principal es sencilla: muchos deportistas entrenan con intensidad, pero no siempre controlan bien la carga, el descanso, la fatiga, el sueno o la hidratacion. El sistema transforma esos datos en una alerta preventiva facil de interpretar.

No es una herramienta de diagnostico medico. Es una herramienta de apoyo para detectar situaciones de riesgo y ayudar a tomar mejores decisiones antes de que aparezca una lesion.

## 2. Problema

El problema que intento resolver es que, en el deporte amateur, muchas decisiones se toman tarde. Normalmente el deportista reduce la carga cuando ya hay dolor, molestias o fatiga acumulada.

Con esta aplicacion se busca hacer lo contrario: registrar variables sencillas y anticipar si el perfil del deportista empieza a mostrar riesgo.

El usuario podria ser un deportista, un entrenador, un preparador fisico, un fisioterapeuta o un club pequeno que quiera hacer un seguimiento basico.

## 3. Datos y modelo

El proyecto parte de un dataset de atletas universitarios con variables personales, deportivas y fisicas.

El dataset original tenia 200 registros y estaba desbalanceado, por lo que se aplico tratamiento del desbalance con SMOTE. Tambien se incorporaron variables relacionadas con sueno, nutricion e hidratacion para enriquecer la prediccion.

Se compararon varios modelos: regresion logistica, random forest, XGBoost y un ensemble. Finalmente, en la app se utiliza XGBoost porque ofrece buen rendimiento y funciona bien para la demo.

La app transforma los datos introducidos por el usuario en las 23 variables que espera el modelo, aplica el scaler entrenado y calcula una probabilidad de lesion. Despues combina esa salida con factores medico-deportivos para generar un score final de 0 a 100.

## 4. Mostrar la app

Ahora paso a la demo funcional.

En el panel lateral se introducen los datos del atleta: edad, genero, altura, peso, deporte, posicion, carga de entrenamiento, descanso, eventos, fatiga, rendimiento, equilibrio de carga, score ACL, sueno, comidas e hidratacion.

Estos datos son sencillos de registrar y estan pensados para que el sistema pueda usarse sin material clinico avanzado.

## 5. Perfil saludable

Primero voy a simular un perfil de bajo riesgo.

Selecciono una intensidad moderada, varias horas de sueno, hidratacion correcta, fatiga baja y suficientes dias de descanso.

Al pulsar predecir, el sistema devuelve un score bajo. Esto significa que, segun los datos introducidos, no aparecen senales criticas importantes.

Ademas del score, la app muestra los factores principales, recomendaciones y posibles lesiones asociadas. En este caso, lo normal es que recomiende mantener los habitos actuales y seguir monitorizando.

## 6. Perfil de sobrecarga

Ahora voy a simular un perfil mas problematico.

Aumento la intensidad, subo las horas de entrenamiento, reduzco los dias de descanso, aumento la fatiga, bajo las horas de sueno y reduzco la hidratacion.

Aqui el score sube porque se combinan varios factores de riesgo: alta carga, poca recuperacion, fatiga elevada y descanso insuficiente.

Esto no significa que el deportista tenga una lesion. Significa que el sistema detecta una situacion preventiva de alerta. La recomendacion seria revisar la carga, mejorar el descanso y, si hay molestias persistentes, consultar con un profesional.

## 7. Registro diario

La segunda parte de la app es el registro diario.

Aqui se puede guardar el estado de un dia concreto: fecha, fatiga, intensidad, horas semanales, descanso, sueno, calidad del sueno, hidratacion, comidas y molestias o notas.

Antes de guardar, la app muestra una vista previa del riesgo estimado para ese dia. Si el registro ya existe para esa fecha, se actualiza en lugar de duplicarse.

Esto permite que la herramienta no sea solo una prediccion puntual, sino un sistema de seguimiento.

## 8. Registro por rango

Tambien existe un registro por rango de dias.

Este modo permite guardar varios dias seguidos con una rutina similar. Es util para la demo y tambien para casos reales donde el deportista ha mantenido una semana de entrenamiento bastante estable.

El rango esta limitado a 31 dias para mantener la herramienta controlada.

## 9. Seguimiento semanal o mensual

Ahora entro en la pestana de seguimiento.

Aqui se puede analizar el historial de los ultimos 7 dias, los ultimos 30 dias o todo el historial.

La app muestra el riesgo medio, dias en riesgo alto, sueno medio y fatiga media. Tambien muestra una grafica de evolucion del score y una grafica de habitos con fatiga, sueno e hidratacion.

Para facilitar la defensa, he incluido dos botones de demo: cargar una semana saludable y cargar una semana de sobrecarga.

Si cargo una semana saludable, el sistema muestra un perfil mas estable. Si cargo una semana de sobrecarga, aparecen mas dias en riesgo alto, alertas automaticas y recomendaciones mas claras.

## 10. Lectura medico-deportiva

Una parte importante es que el sistema no muestra solo un numero.

Tambien genera una lectura medico-deportiva del ultimo registro, con recomendaciones, posibles lesiones asociadas y efectos negativos a vigilar.

Por ejemplo, si hay alta fatiga y poca recuperacion, puede marcar sobrecarga muscular, tendinopatias o riesgo asociado a rodilla y LCA, siempre como orientacion y no como diagnostico.

## 11. Exportacion a Excel

Ademas de verlo dentro de la app, el sistema permite descargar un informe Excel.

Este informe incluye un resumen del periodo, el historial completo, el periodo seleccionado, recomendaciones, posibles lesiones, efectos negativos y graficas.

Esto aporta valor practico porque el informe podria compartirse con un entrenador, preparador fisico o fisioterapeuta. Tambien permite conservar el seguimiento fuera de la app.

En el Excel se ven las hojas de resumen, historial, recomendaciones y graficas. Los niveles de riesgo aparecen coloreados para que el informe sea mas facil de interpretar.

## 12. Valor del producto

El valor principal del proyecto es convertir datos dispersos en una decision sencilla.

El usuario no recibe solo una probabilidad, sino un score, una clasificacion, factores de riesgo, recomendaciones, posibles lesiones, efectos negativos, evolucion temporal y un informe descargable.

Esto hace que el resultado sea mas util para un contexto real de prevencion deportiva.

## 13. Limitaciones

Tambien hay limitaciones importantes.

El dataset es pequeno y procede de atletas universitarios, por lo que no representa todos los perfiles deportivos. Algunas variables de sueno y nutricion son sinteticas. El historial es local, no multiusuario. Y no se calcula un ACWR real porque no hay una serie temporal real del dataset original.

Por eso insisto en que el sistema no sustituye a un medico, fisioterapeuta o preparador fisico. Es una herramienta de apoyo preventivo.

## 14. Mejoras futuras

Como mejoras futuras, el sistema podria incorporar usuarios autenticados, base de datos persistente, integracion con wearables, calculo real de ACWR, datasets mas grandes por deporte y validacion con profesionales de medicina deportiva.

## 15. Cierre

Como conclusion, el proyecto demuestra un MVP funcional capaz de predecir y monitorizar el riesgo de lesion de forma interpretable.

El valor no esta solo en el modelo de machine learning, sino en como se presenta la informacion para que el usuario pueda actuar: ajustar la carga, descansar, mejorar hidratacion, vigilar molestias o consultar con un profesional cuando sea necesario.

## Preguntas probables

### Por que usas un score de 0 a 100?

Porque es mas facil de interpretar para un usuario no tecnico que una probabilidad aislada. El score combina la salida del modelo con factores preventivos relevantes.

### Por que dices que no es diagnostico medico?

Porque el sistema no explora al deportista ni utiliza pruebas clinicas. Solo analiza datos generales y genera una alerta preventiva.

### Que aporta el seguimiento frente a una prediccion puntual?

Permite ver la evolucion. Una prediccion puntual puede salir bien un dia, pero el seguimiento permite detectar si el riesgo sube durante una semana o un mes.

### Que aporta el Excel?

Permite exportar el seguimiento y compartirlo. Es util para entregar un resumen a un entrenador, preparador fisico o fisioterapeuta.

### Por que XGBoost?

Porque obtuvo buen rendimiento en la comparacion de modelos y se integra bien en la aplicacion final.

### Que mejorarias con mas tiempo?

Ampliaria el dataset, validaria las recomendaciones con profesionales, anadiria usuarios reales, base de datos, wearables y calculo real de carga aguda-cronica.
