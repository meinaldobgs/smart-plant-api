-- Database: smart_plant_monitoring (PostgreSQL)

-- 1. Tabel 'users' (Pengguna)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel 'plants' (Data Tanaman & Jamur)
-- Relasi 1:N dari users ke plants
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    jenis VARCHAR(50) NOT NULL, -- Contoh: 'Tanaman' atau 'Jamur'
    ideal_temperature DECIMAL(5, 2),
    ideal_air_humidity DECIMAL(5, 2),
    ideal_soil_humidity DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabel 'devices' (Perangkat Sensor IoT)
-- Relasi 1:N dari plants ke devices (1 tanaman bisa dipantau banyak sensor/node)
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL,
    mac_address VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);

-- 4. Tabel 'sensor_data' (Riwayat Pembacaan Sensor)
-- Relasi 1:N dari devices ke sensor_data
CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    device_id INT NOT NULL,
    temperature DECIMAL(5, 2),
    air_humidity DECIMAL(5, 2),
    soil_humidity DECIMAL(5, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);

-- 5. Tabel 'watering_logs' (Riwayat Penyiraman)
-- Relasi 1:N dari plants ke watering_logs
CREATE TABLE watering_logs (
    id SERIAL PRIMARY KEY,
    plant_id INT NOT NULL,
    watered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
);
