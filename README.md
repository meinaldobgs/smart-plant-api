# Smart Plant Monitoring API

REST API sederhana untuk memantau kondisi **tanaman dan jamur** berbasis sensor IoT. Pengguna mendaftarkan tanaman beserta kondisi idealnya (suhu, kelembapan udara, kelembapan tanah), memasang perangkat sensor pada tanaman tersebut, lalu perangkat mengirim hasil pembacaan secara berkala ke API. Riwayat penyiraman juga dapat dicatat.

Project ini dibuat sebagai Tugas Akhir Learning Labs: Backend Development.

## Informasi Project

| Item | Keterangan |
|---|---|
| Nama project | Smart Plant Monitoring API |
| URL deployment | https://smart-plant-api.vercel.app |
| Repository | https://github.com/meinaldobgs/smart-plant-api |
| Teknologi | Node.js, Express, PostgreSQL (Supabase), Vercel |
| Format data | JSON |

## ERD / Skema Database

Database terdiri dari **5 tabel** yang saling berelasi lewat foreign key.

![ERD Smart Plant Monitoring](erd.png)

| Relasi | Jenis | Keterangan |
|---|---|---|
| `users` → `plants` | One-to-many | Satu pengguna memiliki banyak tanaman |
| `plants` → `devices` | One-to-many | Satu tanaman dipantau oleh banyak perangkat sensor |
| `devices` → `sensor_data` | One-to-many | Satu perangkat menghasilkan banyak data pembacaan |
| `plants` → `watering_logs` | One-to-many | Satu tanaman memiliki banyak catatan penyiraman |

Script pembuatan tabel tersedia di file [`database.sql`](database.sql).

## Daftar Endpoint

Base URL: `https://smart-plant-api.vercel.app`

| No | Method | Endpoint | Fungsi |
|---|---|---|---|
| 1 | GET | `/plants` | Mengambil semua tanaman |
| 2 | POST | `/plants` | Menambah tanaman baru |
| 3 | PUT | `/plants/:id` | Mengubah data tanaman |
| 4 | DELETE | `/plants/:id` | Menghapus tanaman |
| 5 | POST | `/sensor-data` | Merekam data sensor |
| 6 | GET | `/sensor-data` | Mengambil 50 data sensor terbaru |

Resource utama dengan CRUD lengkap: **plants**.

> Catatan: kolom bertipe DECIMAL (suhu dan kelembapan) dikembalikan PostgreSQL dalam bentuk teks, misalnya `"25.00"`.

---

### 1. Ambil Semua Tanaman

- **Method**: GET
- **URL**: `https://smart-plant-api.vercel.app/plants`
- **Deskripsi**: Mengambil seluruh data tanaman dan jamur
- **Headers**: tidak ada
- **Request Body**: tidak ada
- **Response Sukses (200)**:

```json
[
  {
    "id": 2,
    "user_id": 1,
    "name": "Selada Hidroponik",
    "jenis": "Tanaman",
    "ideal_temperature": "22.00",
    "ideal_air_humidity": "65.00",
    "ideal_soil_humidity": "55.00",
    "created_at": "2026-11-09T10:16:25.131Z"
  },
  {
    "id": 5,
    "user_id": 1,
    "name": "Tomat Cherry",
    "jenis": "Tanaman",
    "ideal_temperature": "25.00",
    "ideal_air_humidity": "70.00",
    "ideal_soil_humidity": "60.00",
    "created_at": "2026-11-10T08:04:09.681Z"
  }
]
```

- **Response Error (500)**:

```json
{
  "error": "pesan kesalahan dari server atau database"
}
```

---

### 2. Tambah Tanaman

- **Method**: POST
- **URL**: `https://smart-plant-api.vercel.app/plants`
- **Deskripsi**: Menambahkan tanaman atau jamur baru milik pengguna
- **Headers**: `Content-Type: application/json`
- **Request Body**:

```json
{
  "user_id": 1,
  "name": "Jamur Tiram Putih",
  "jenis": "Jamur",
  "ideal_temperature": 24,
  "ideal_air_humidity": 85,
  "ideal_soil_humidity": 70
}
```

Field wajib: `user_id`, `name`, `jenis`. Field `ideal_*` bersifat opsional.

- **Response Sukses (201)**:

```json
{
  "message": "Tanaman berhasil ditambahkan",
  "data": {
    "id": 4,
    "user_id": 1,
    "name": "Jamur Tiram Putih",
    "jenis": "Jamur",
    "ideal_temperature": "24.00",
    "ideal_air_humidity": "85.00",
    "ideal_soil_humidity": "70.00",
    "created_at": "2026-11-10T07:09:32.885Z"
  }
}
```

- **Response Error (400)** (field wajib tidak lengkap):

```json
{
  "error": "Field user_id, name, dan jenis wajib diisi"
}
```

- **Response Error (400)** (`user_id` tidak terdaftar):

```json
{
  "error": "user_id tidak ditemukan"
}
```

- **Response Error (500)**:

```json
{
  "error": "Gagal menambahkan tanaman"
}
```

---

### 3. Ubah Tanaman

- **Method**: PUT
- **URL**: `https://smart-plant-api.vercel.app/plants/:id` (contoh: `/plants/2`)
- **Deskripsi**: Mengubah seluruh data tanaman berdasarkan ID
- **Headers**: `Content-Type: application/json`
- **Request Body**:

```json
{
  "name": "Selada Hidroponik",
  "jenis": "Tanaman",
  "ideal_temperature": 22,
  "ideal_air_humidity": 65,
  "ideal_soil_humidity": 55
}
```

Field wajib: `name`, `jenis`.

- **Response Sukses (200)**:

```json
{
  "message": "Tanaman berhasil diperbarui",
  "data": {
    "id": 2,
    "user_id": 1,
    "name": "Selada Hidroponik",
    "jenis": "Tanaman",
    "ideal_temperature": "22.00",
    "ideal_air_humidity": "65.00",
    "ideal_soil_humidity": "55.00",
    "created_at": "2026-11-09T10:16:25.131Z"
  }
}
```

- **Response Error (400)**:

```json
{
  "error": "Field name dan jenis wajib diisi"
}
```

- **Response Error (404)**:

```json
{
  "error": "Tanaman tidak ditemukan"
}
```

- **Response Error (500)**:

```json
{
  "error": "Gagal memperbarui tanaman"
}
```

---

### 4. Hapus Tanaman

- **Method**: DELETE
- **URL**: `https://smart-plant-api.vercel.app/plants/:id` (contoh: `/plants/4`)
- **Deskripsi**: Menghapus tanaman berdasarkan ID. Perangkat dan riwayat sensor milik tanaman tersebut ikut terhapus (`ON DELETE CASCADE`).
- **Headers**: tidak ada
- **Request Body**: tidak ada
- **Response Sukses (200)**:

```json
{
  "message": "Tanaman berhasil dihapus"
}
```

- **Response Error (404)**:

```json
{
  "error": "Tanaman tidak ditemukan"
}
```

- **Response Error (400)** (ID bukan angka):

```json
{
  "error": "ID harus berupa angka"
}
```

- **Response Error (500)**:

```json
{
  "error": "Gagal menghapus tanaman"
}
```

---

### 5. Rekam Data Sensor

- **Method**: POST
- **URL**: `https://smart-plant-api.vercel.app/sensor-data`
- **Deskripsi**: Menyimpan hasil pembacaan sensor dari sebuah perangkat
- **Headers**: `Content-Type: application/json`
- **Request Body**:

```json
{
  "device_id": 1,
  "temperature": 23.5,
  "air_humidity": 67,
  "soil_humidity": 58
}
```

- **Response Sukses (201)**:

```json
{
  "message": "Data sensor berhasil direkam",
  "data": {
    "id": 1,
    "device_id": 1,
    "temperature": "23.50",
    "air_humidity": "67.00",
    "soil_humidity": "58.00",
    "recorded_at": "2026-11-10T07:22:53.842Z"
  }
}
```

- **Response Error (500)** (misalnya `device_id` belum terdaftar):

```json
{
  "error": "Gagal menyimpan data sensor"
}
```

---

### 6. Ambil Riwayat Data Sensor

- **Method**: GET
- **URL**: `https://smart-plant-api.vercel.app/sensor-data`
- **Deskripsi**: Mengambil 50 data sensor terbaru, diurutkan dari yang paling baru
- **Headers**: tidak ada
- **Request Body**: tidak ada
- **Response Sukses (200)**:

```json
[
  {
    "id": 2,
    "device_id": 1,
    "temperature": "24.80",
    "air_humidity": "64.00",
    "soil_humidity": "52.00",
    "recorded_at": "2026-11-10T07:24:23.283Z"
  },
  {
    "id": 1,
    "device_id": 1,
    "temperature": "23.50",
    "air_humidity": "67.00",
    "soil_humidity": "58.00",
    "recorded_at": "2026-11-10T07:22:53.842Z"
  }
]
```

- **Response Error (500)**:

```json
{
  "error": "Gagal mengambil riwayat sensor"
}
```

---

## Bukti Pengujian

Seluruh endpoint diuji menggunakan Thunder Client dengan URL Vercel (bukan localhost).

### GET /plants (200)
![GET plants](bukti-pengujian/01-get-plants.png)

### POST /plants (201)
![POST plants](bukti-pengujian/02-post-plants.png)

### PUT /plants/:id (200)
![PUT plants](bukti-pengujian/03-put-plants.png)

### DELETE /plants/:id (200)
![DELETE plants](bukti-pengujian/04-delete-plants.png)

### DELETE /plants/:id, data tidak ditemukan (404)
![DELETE 404](bukti-pengujian/05-delete-404.png)

### POST /plants, field wajib tidak lengkap (400)
![POST 400](bukti-pengujian/06-post-400.png)

### POST /sensor-data (201)
![POST sensor-data](bukti-pengujian/07-post-sensor-data.png)

### GET /sensor-data (200)
![GET sensor-data](bukti-pengujian/08-get-sensor-data.png)

## Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js (versi LTS)
- Database PostgreSQL yang dapat diakses dari internet (contoh: Supabase atau Neon)

### Langkah
1. Clone repository dan masuk ke foldernya:

   ```bash
   git clone https://github.com/meinaldobgs/smart-plant-api.git
   cd smart-plant-api
   ```

2. Install dependensi:

   ```bash
   npm install
   ```

3. Buat tabel di database dengan menjalankan isi file `database.sql` (misalnya lewat SQL Editor di Supabase).

4. Buat file `.env` di folder utama project, lalu isi alamat koneksi database:

   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres
   ```

   File `.env` sudah masuk `.gitignore`, sehingga tidak ikut terunggah ke GitHub.

5. Jalankan server:

   ```bash
   node index.js
   ```

   Server berjalan di `http://localhost:3001`.

6. Uji endpoint memakai Thunder Client atau Postman, misalnya `GET http://localhost:3001/plants`.

## Deployment

API di-deploy ke Vercel dan otomatis diperbarui setiap ada push ke branch `main`. Alamat database tidak disimpan di kode, melainkan di **Environment Variables** Vercel dengan nama `DATABASE_URL`. Konfigurasi routing ada di file `vercel.json`.

## Struktur Project

```
smart-plant-api/
├── bukti-pengujian/     # screenshot pengujian endpoint
├── erd.png              # gambar ERD
├── database.sql         # script pembuatan tabel
├── index.js             # server Express dan seluruh endpoint
├── vercel.json          # konfigurasi deployment Vercel
├── dashboard.html       # tampilan sederhana (opsional)
├── package.json
└── README.md
```
