PRAGMA foreign_keys = ON;

-- =====================================================
-- 1. ¿Qué deporte tiene peor descanso promedio?
-- =====================================================
SELECT d.nombre_deporte,
       ROUND(AVG(f.sleep_hours),2) AS avg_sueno
FROM fact_habitos_diarios f
JOIN dim_deporte d ON f.sport_id = d.sport_id
GROUP BY d.nombre_deporte
ORDER BY avg_sueno ASC;

-- Permite detectar deportes asociados a peor descanso.

-- =====================================================
-- 2. Relación entre nivel de entrenamiento y descanso
-- =====================================================
SELECT n.descripcion AS nivel_entrenamiento,
       ROUND(AVG(f.sleep_hours),2) AS avg_sueno,
       ROUND(AVG(f.training_minutes),1) AS avg_minutos
FROM fact_habitos_diarios f
JOIN dim_nivel_entrenamiento n ON f.level_id = n.level_id
GROUP BY n.descripcion;

-- A mayor carga, menor descanso promedio.

-- =====================================================
-- 3. Clasificación de riesgo por día
-- =====================================================
SELECT habit_id,
       user_id,
       training_minutes,
       sleep_hours,
       CASE
           WHEN training_minutes > 100 AND sleep_hours < 6
                THEN 'RIESGO ALTO'
           WHEN training_minutes > 80 AND sleep_hours < 7
                THEN 'RIESGO MEDIO'
           ELSE 'RIESGO BAJO'
       END AS nivel_riesgo
FROM fact_habitos_diarios;

------------------------------------------------------

-- =====================================================
-- 4. Usuarios con sobreentrenamiento recurrente (CTE)
-- =====================================================
WITH dias_riesgo AS (
    SELECT user_id,
           COUNT(*) AS dias_peligro
    FROM fact_habitos_diarios
    WHERE training_minutes > 100
      AND sleep_hours < 6.5
    GROUP BY user_id
)
SELECT *
FROM dias_riesgo
WHERE dias_peligro >= 2;

-- Usuarios que podrían necesitar descanso o ajuste de carga.


-- =====================================================
-- 5. Ranking de usuarios por carga total
-- =====================================================
SELECT user_id,
       SUM(training_minutes) AS total_minutos,
       RANK() OVER (ORDER BY SUM(training_minutes) DESC) AS ranking_carga
FROM fact_habitos_diarios
GROUP BY user_id;


-- =====================================================
-- 6. Diferencia entre semana y fin de semana
-- =====================================================
SELECT
    CASE
        WHEN c.dia_semana IN ('Sábado', 'Domingo')
             THEN 'Fin de semana'
        ELSE 'Entre semana'
    END AS tipo_dia,
    ROUND(AVG(f.training_minutes),1) AS avg_entrenamiento,
    ROUND(AVG(f.sleep_hours),2) AS avg_sueno
FROM fact_habitos_diarios f
JOIN dim_calendario c ON f.date_id = c.date_id
GROUP BY tipo_dia;

-- Cambios de hábitos según el tipo de día.

-- =====================================================
-- 7. Uso de la vista resumen
-- =====================================================
SELECT *
FROM vw_resumen_mensual_deporte;
