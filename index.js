const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log("✅ DATABASE BERHASIL TERKONEKSI!"))
    .catch(err => console.error("❌ ERROR KONEKSI:", err.message));

app.get('/plants', async (req, res) => {
    console.log("➡️ Ada request GET masuk ke /plants...");
    try {
        const result = await pool.query('SELECT * FROM plants');
        console.log("✅ Data berhasil diambil:", result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("❌ ERROR SAAT QUERY:", err.message);
        res.status(500).json({ error: err.message });
    }
});
app.post('/sensor-data', async (req, res) => {
    const { plant_id, temperature, air_humidity, soil_humidity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO sensor_data (plant_id, temperature, air_humidity, soil_humidity) VALUES ($1, $2, $3, $4) RETURNING *',
            [plant_id, temperature, air_humidity, soil_humidity]
        );
        res.status(201).json({ message: "Data sensor berhasil direkam", data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menyimpan data sensor" });
    }
});

app.listen(3001, () => console.log("🚀 Server jalan di port 3001"));