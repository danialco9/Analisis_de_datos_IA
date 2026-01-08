PRAGMA foreign_keys = ON;

-- Deportes con peor descanso promedio
SELECT
    d.nombre_deporte,
    ROUND(AVG(f.sleep_hours), 2) AS avg_sueno,
    COUNT(*) AS registros
FROM fact_habitos_diarios f
INNER JOIN dim_deporte d
        ON f.sport_id = d.sport_id
GROUP BY d.nombre_deporte
ORDER BY avg_sueno ASC;

--Esto permite vender planes específicos de recuperación o asesoramiento personalizado por deporte

-- ==================================================

-- Comparación de niveles de intensidad en los entrenamientos y su impacto en el sueño y minutos de entrenamiento
SELECT
    n.descripcion AS nivel_entrenamiento,
    ROUND(AVG(f.training_minutes), 1) AS avg_minutos,
    ROUND(AVG(f.sleep_hours), 2) AS avg_sueno,
    CASE
        WHEN AVG(f.sleep_hours) < 6.5 THEN 'DESCANSO DEFICIENTE'
        ELSE 'DESCANSO ADECUADO'
    END AS calidad_descanso
FROM fact_habitos_diarios f
INNER JOIN dim_nivel_entrenamiento n
        ON f.level_id = n.level_id
GROUP BY n.descripcion;
-- Sirve para cómo la intensidad afecta al descanso, lo que puede guiar recomendaciones de entrenamiento personalizadas.
-- Esto seria la base para ofrecer planes de entrenamiento adaptativos según el nivel de intensidad y su impacto en el sueño.

-- ==================================================

-- Usuarios en riesgo por sobreentrenamiento y falta de sueño
WITH resumen_usuario AS (
    SELECT
        user_id,
        AVG(training_minutes) AS avg_minutos,
        AVG(sleep_hours) AS avg_sueno
    FROM fact_habitos_diarios
    GROUP BY user_id
),
usuarios_riesgo AS (
    SELECT
        user_id,
        avg_minutos,
        avg_sueno,
        CASE
            WHEN avg_minutos > 100 AND avg_sueno < 6.5
                 THEN 'USUARIO RIESGO'
            ELSE 'USUARIO NORMAL'
        END AS clasificacion
    FROM resumen_usuario
)
SELECT *
FROM usuarios_riesgo
WHERE clasificacion = 'USUARIO RIESGO';
-- Identificar usuarios en riesgo para ofrecerles asesoramiento personalizado o planes de recuperación, lo que puede ser un servicio premium.
-- ==================================================

-- Análisis de variación diaria en hábitos de entrenamiento y sueño
SELECT
    user_id,
    training_minutes,
    ROUND(
        AVG(training_minutes) OVER (PARTITION BY user_id),
        1
    ) AS avg_entrenamiento_usuario
FROM fact_habitos_diarios
ORDER BY user_id;
-- Sirve para idemtificar los usuarios con alta variabilidad en sus hábitos para ofrecerles planes de entrenamiento más estructurados y consistentes.
-- Tambien sirve para mostrar métricas avanzadas en dashboards premium, comparando cada día con la media del usuario.


-- ==================================================

-- Usuarios con menos días registrados y su perfil
SELECT
    u.user_id,
    u.edad,
    COUNT(f.habit_id) AS dias_registrados
FROM dim_usuario u
LEFT JOIN fact_habitos_diarios f
       ON u.user_id = f.user_id
GROUP BY u.user_id, u.edad
ORDER BY dias_registrados ASC;
-- Detectar usuarios inactivos para campañas de reactivación de motivación personalizadas.

-- ==================================================

-- Vista resumen mensual por deporte
SELECT *
FROM vw_resumen_mensual_deporte;
