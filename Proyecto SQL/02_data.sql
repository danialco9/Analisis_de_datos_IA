-- =====================================================
-- 02_data.sql
-- Carga de datos + limpieza + correcciones
-- Motor: SQLite
-- =====================================================

PRAGMA foreign_keys = ON;

-- =========================
-- INICIO TRANSACCIÓN
-- =========================
BEGIN TRANSACTION;

-- -------------------------
-- USUARIOS
-- -------------------------
INSERT INTO dim_usuario (user_id, edad, peso_kg, altura_cm, nivel, fecha_registro) VALUES
(1, 20, 51.0, 168, 'amateur', '2025-01-01'),
(2, 22, 68.5, 175, 'intermedio', '2025-01-01'),
(3, 19, 60.0, 170, 'amateur', '2025-01-02'),
(4, 25, 72.0, 180, 'intermedio', '2025-01-02'),
(5, 18, 55.0, 165, 'amateur', '2025-01-03'),
(6, 23, 70.0, 178, 'intermedio', '2025-01-03');

-- -------------------------
-- DEPORTES
-- -------------------------
INSERT INTO dim_deporte (sport_id, nombre_deporte, categoria) VALUES
(1, 'Vóley', 'equipo'),
(2, 'Gimnasio', 'individual'),
(3, 'Running', 'individual'),
(4, 'Fútbol', 'equipo');

-- -------------------------
-- NIVELES DE ENTRENAMIENTO
-- -------------------------
INSERT INTO dim_nivel_entrenamiento (level_id, descripcion) VALUES
(1, 'baja'),
(2, 'media'),
(3, 'alta');

-- -------------------------
-- CALENDARIO (1 semana)
-- -------------------------
INSERT INTO dim_calendario (date_id, fecha, dia, mes, anio, dia_semana) VALUES
(1, '2025-01-01', 1, 1, 2025, 'Miércoles'),
(2, '2025-01-02', 2, 1, 2025, 'Jueves'),
(3, '2025-01-03', 3, 1, 2025, 'Viernes'),
(4, '2025-01-04', 4, 1, 2025, 'Sábado'),
(5, '2025-01-05', 5, 1, 2025, 'Domingo'),
(6, '2025-01-06', 6, 1, 2025, 'Lunes'),
(7, '2025-01-07', 7, 1, 2025, 'Martes');

-- -------------------------
-- HÁBITOS DIARIOS (FACT)
-- -------------------------
-- Usuario 1
INSERT INTO fact_habitos_diarios (habit_id, user_id, date_id, sport_id, level_id, training_minutes, sleep_hours, meals_count) VALUES
(1, 1, 1, 1, 2, 90, 7.5, 4),
(2, 1, 2, 2, 3, 120, 6.0, 3),
(3, 1, 3, 1, 3, 110, 6.5, 3),
(4, 1, 4, 3, 1, 45, 8.5, 5);

-- Usuario 2
INSERT INTO fact_habitos_diarios VALUES
(5, 2, 1, 2, 3, 100, 6.0, 3),
(6, 2, 2, 4, 3, 130, 5.5, 2),
(7, 2, 3, 4, 3, 125, 5.0, 2),
(8, 2, 5, 2, 1, 60, 8.5, 5);

-- Usuario 3
INSERT INTO fact_habitos_diarios VALUES
(9, 3, 2, 3, 2, 70, 7.0, 4),
(10, 3, 3, 2, 3, 100, 5.0, 2),
(11, 3, 4, 3, 2, 60, 7.5, 4);

-- Usuario 4
INSERT INTO fact_habitos_diarios VALUES
(12, 4, 1, 4, 2, 90, 7.0, 4),
(13, 4, 2, 4, 3, 130, 6.0, 3),
(14, 4, 6, 2, 2, 75, 8.0, 5);

-- Usuario 5
INSERT INTO fact_habitos_diarios VALUES
(15, 5, 3, 1, 1, 60, 8.5, 5),
(16, 5, 4, 1, 2, 85, 7.5, 4),
(17, 5, 5, 3, 1, 40, 9.0, 5);

-- Usuario 6
INSERT INTO fact_habitos_diarios VALUES
(18, 6, 2, 2, 3, 120, 6.0, 3),
(19, 6, 3, 2, 3, 115, 5.5, 2),
(20, 6, 7, 4, 2, 90, 7.0, 4);

-- =========================
-- UPDATE CON SENTIDO
-- =========================
-- Usuario 3 reportó mal las horas de sueño
UPDATE fact_habitos_diarios
SET sleep_hours = 6.0
WHERE habit_id = 10;

-- Ajuste: nivel alto debe tener al menos 3 comidas
UPDATE fact_habitos_diarios
SET meals_count = 3
WHERE level_id = 3 AND meals_count < 3;

-- =========================
-- DELETE CON SENTIDO
-- =========================
-- Eliminar registros inconsistentes (entrenamiento 0 y nivel alto)
DELETE FROM fact_habitos_diarios
WHERE training_minutes = 0 AND level_id = 3;

-- =========================
-- FIN TRANSACCIÓN
-- =========================
COMMIT;

