-- =====================================================
-- 01_schema.sql 
-- Proyecto SQL: Plataforma de hábitos saludables
-- =====================================================

-- Activar claves foráneas en SQLite
PRAGMA foreign_keys = ON;

-- =========================
-- ELIMINAR TABLAS
-- =========================

DROP TABLE IF EXISTS fact_habitos_diarios;
DROP TABLE IF EXISTS dim_usuario;
DROP TABLE IF EXISTS dim_deporte;
DROP TABLE IF EXISTS dim_calendario;
DROP TABLE IF EXISTS dim_nivel_entrenamiento;

-- =========================
-- TABLAS DE DIMENSIONES
-- =========================

-- Tabla Usuario
-- Representa a cada joven deportista
CREATE TABLE IF NOT EXISTS dim_usuario (
    user_id INTEGER PRIMARY KEY,
    edad INTEGER NOT NULL CHECK (edad BETWEEN 12 AND 30),
    peso_kg REAL,
    altura_cm INTEGER,
    nivel TEXT NOT NULL CHECK (nivel IN ('amateur', 'intermedio')),
    fecha_registro DATE DEFAULT CURRENT_DATE
);

-- Tabla Deporte
-- Cada tipo de deporte disponible en la plataforma
CREATE TABLE IF NOT EXISTS dim_deporte (
    sport_id INTEGER PRIMARY KEY,
    nombre_deporte TEXT NOT NULL UNIQUE,
    categoria TEXT CHECK (categoria IN ('individual', 'equipo'))
);

-- Tabla Calendario
-- Permite analizar los hábitos por día, mes y año
CREATE TABLE IF NOT EXISTS dim_calendario (
    date_id INTEGER PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    dia INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    dia_semana TEXT NOT NULL
);

-- Tabla Nivel de Entrenamiento
-- Indica la intensidad del entrenamiento diario
CREATE TABLE IF NOT EXISTS dim_nivel_entrenamiento (
    level_id INTEGER PRIMARY KEY,
    descripcion TEXT NOT NULL UNIQUE
);

-- =========================
-- TABLA DE HECHOS
-- =========================

-- Tabla central con métricas diarias
-- Guarda los hábitos de un usuario en un día concreto
CREATE TABLE IF NOT EXISTS fact_habitos_diarios (
    habit_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date_id INTEGER NOT NULL,
    sport_id INTEGER NOT NULL,
    level_id INTEGER NOT NULL,
    training_minutes INTEGER CHECK (training_minutes >= 0),
    sleep_hours REAL CHECK (sleep_hours BETWEEN 0 AND 24),
    meals_count INTEGER CHECK (meals_count BETWEEN 0 AND 10),

    -- Claves foráneas: aseguran que los datos existan en las dimensiones
    FOREIGN KEY (user_id) REFERENCES dim_usuario(user_id),
    FOREIGN KEY (date_id) REFERENCES dim_calendario(date_id),
    FOREIGN KEY (sport_id) REFERENCES dim_deporte(sport_id),
    FOREIGN KEY (level_id) REFERENCES dim_nivel_entrenamiento(level_id)
);

-- =========================
-- ÍNDICES
-- =========================

-- Índice para acelerar búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_fact_user_date
ON fact_habitos_diarios (user_id, date_id);

-- =========================
-- VISTA
-- =========================

-- Vista resumen mensual por deporte
-- Permite ver promedios de sueño y entrenamiento por mes y deporte
CREATE VIEW IF NOT EXISTS vw_resumen_mensual_deporte AS
SELECT
    d.nombre_deporte,
    c.mes,
    c.anio,
    COUNT(f.habit_id) AS dias_registrados,
    AVG(f.sleep_hours) AS avg_sueno,
    AVG(f.training_minutes) AS avg_entrenamiento
FROM fact_habitos_diarios f
JOIN dim_deporte d ON f.sport_id = d.sport_id
JOIN dim_calendario c ON f.date_id = c.date_id
GROUP BY d.nombre_deporte, c.mes, c.anio;
