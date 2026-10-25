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

app.listen(3001, () => console.log("🚀 Server jalan di port 3001"));