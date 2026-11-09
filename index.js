require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
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
    const { device_id, temperature, air_humidity, soil_humidity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO sensor_data (device_id, temperature, air_humidity, soil_humidity) VALUES ($1, $2, $3, $4) RETURNING *',
            [device_id, temperature, air_humidity, soil_humidity]
        );
        res.status(201).json({ message: "Data sensor berhasil direkam", data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menyimpan data sensor" });
    }
});
app.get('/sensor-data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sensor_data ORDER BY recorded_at DESC LIMIT 50');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil riwayat sensor" });
    }
});

// POST = menambah tanaman baru
app.post('/plants', async (req, res) => {
    const { user_id, name, jenis, ideal_temperature, ideal_air_humidity, ideal_soil_humidity } = req.body;
    if (!user_id || !name || !jenis) {
        return res.status(400).json({ error: 'Field user_id, name, dan jenis wajib diisi' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO plants (user_id, name, jenis, ideal_temperature, ideal_air_humidity, ideal_soil_humidity)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id, name, jenis, ideal_temperature, ideal_air_humidity, ideal_soil_humidity]
        );
        res.status(201).json({ message: 'Tanaman berhasil ditambahkan', data: result.rows[0] });
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ error: 'user_id tidak ditemukan' });
        console.error(err);
        res.status(500).json({ error: 'Gagal menambahkan tanaman' });
    }
});

// PUT = mengubah data tanaman
app.put('/plants/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID harus berupa angka' });
    const { name, jenis, ideal_temperature, ideal_air_humidity, ideal_soil_humidity } = req.body;
    if (!name || !jenis) {
        return res.status(400).json({ error: 'Field name dan jenis wajib diisi' });
    }
    try {
        const result = await pool.query(
            `UPDATE plants SET name = $1, jenis = $2, ideal_temperature = $3,
             ideal_air_humidity = $4, ideal_soil_humidity = $5 WHERE id = $6 RETURNING *`,
            [name, jenis, ideal_temperature, ideal_air_humidity, ideal_soil_humidity, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tanaman tidak ditemukan' });
        res.status(200).json({ message: 'Tanaman berhasil diperbarui', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal memperbarui tanaman' });
    }
});

// DELETE = menghapus tanaman
app.delete('/plants/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID harus berupa angka' });
    try {
        const result = await pool.query('DELETE FROM plants WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Tanaman tidak ditemukan' });
        res.status(200).json({ message: 'Tanaman berhasil dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal menghapus tanaman' });
    }
});

if (require.main === module) {
    app.listen(3001, () => console.log("🚀 Server jalan di port 3001"));
}
module.exports = app;
