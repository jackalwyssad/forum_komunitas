# 📘 Panduan Kolaborasi GitHub — Forum Diskusi

Dokumen ini berisi panduan lengkap cara **clone, setup, dan kolaborasi** menggunakan GitHub untuk project Forum Diskusi.

---

## 📋 Daftar Isi

- [Prasyarat](#-prasyarat)
- [Clone & Setup Project (Untuk Rekan Kerja Baru)](#-clone--setup-project-untuk-rekan-kerja-baru)
- [Push Update ke GitHub](#-push-update-ke-github)
- [Workflow Kolaborasi Sehari-hari](#-workflow-kolaborasi-sehari-hari)
- [Mengatasi Conflict](#-mengatasi-conflict)
- [Perintah Git yang Sering Dipakai](#-perintah-git-yang-sering-dipakai)
- [Troubleshooting](#-troubleshooting)

---

## 📦 Prasyarat

Pastikan semua software berikut sudah terinstall di komputer:

| Software | Versi Minimal | Link Download | Cek Instalasi |
|----------|---------------|---------------|---------------|
| **Git** | Terbaru | [git-scm.com](https://git-scm.com) | `git --version` |
| **PHP** | >= 8.1 | [windows.php.net](https://windows.php.net/download) atau via Laragon | `php --version` |
| **Composer** | Terbaru | [getcomposer.org](https://getcomposer.org) | `composer --version` |
| **Node.js** | >= 18 | [nodejs.org](https://nodejs.org) | `node --version` |
| **PostgreSQL** | Terbaru | [postgresql.org](https://www.postgresql.org/download) | Buka pgAdmin |

> **Catatan:** PHP harus memiliki ekstensi `pdo_pgsql` yang aktif untuk koneksi ke PostgreSQL.

---

## 🚀 Clone & Setup Project (Untuk Rekan Kerja Baru)

Ikuti langkah-langkah berikut **satu per satu** secara berurutan.

### Step 1 — Setup Git (Sekali Saja)

```bash
git config --global user.name "Nama Lengkap Kamu"
git config --global user.email "email-github-kamu@gmail.com"
```

### Step 2 — Clone Repository

```bash
# Pilih folder tempat menyimpan project
cd Desktop

# Clone repository
git clone https://github.com/USERNAME/forum-diskusi.git

# Masuk ke folder project
cd forum-diskusi
```

> Ganti `USERNAME` dengan username GitHub pemilik repository.

### Step 3 — Setup Backend (Laravel)

```bash
cd backend

# Install dependency PHP
composer install

# Copy file konfigurasi environment
copy .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4 — Buat Database PostgreSQL

Pilih salah satu cara:

**Cara A — Lewat pgAdmin (GUI):**
1. Buka **pgAdmin** (sudah terinstall bersama PostgreSQL)
2. Login dengan password PostgreSQL kamu
3. Klik kanan **"Databases"** → **"Create"** → **"Database"**
4. Isi nama: **`forum_komunitas`**
5. Klik **"Save"**

**Cara B — Lewat Terminal (psql):**
```bash
psql -U postgres
# Masukkan password PostgreSQL kamu

CREATE DATABASE forum_komunitas;
\q
```

### Step 5 — Edit File `.env`

Buka file **`backend/.env`** dengan text editor, lalu **ubah bagian database**:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=forum_komunitas
DB_USERNAME=postgres
DB_PASSWORD=password_postgresql_kamu
```

> ⚠️ **PENTING:** Ganti `password_postgresql_kamu` dengan password PostgreSQL yang kamu buat saat menginstall PostgreSQL.

### Step 6 — Jalankan Migration & Seeder

```bash
# Buat semua tabel dan isi data contoh
php artisan migrate --seed

# Buat symlink untuk file upload (avatar)
php artisan storage:link
```

Setelah perintah ini selesai, database kamu akan berisi:
- ✅ 1 Admin + 5 User
- ✅ 6 Kategori diskusi
- ✅ 8 Thread diskusi
- ✅ 12 Reply / komentar
- ✅ Likes random

### Step 7 — Setup Frontend (React)

```bash
# Kembali ke root project
cd ..

# Masuk ke folder frontend
cd frontend

# Install dependency JavaScript
npm install
```

### Step 8 — Jalankan Aplikasi

Buka **2 terminal terpisah**:

**Terminal 1 — Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Step 9 — Buka di Browser

Buka browser → **http://localhost:5173**

**Akun Login:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@forum.com` | `password123` |
| User | `budi@forum.com` | `password123` |
| User | `siti@forum.com` | `password123` |
| User | `ahmad@forum.com` | `password123` |
| User | `dewi@forum.com` | `password123` |
| User | `rizky@forum.com` | `password123` |

---

## 📤 Push Update ke GitHub

Setiap kali selesai ngoding dan ingin upload perubahan:

```bash
# 1. Lihat file yang berubah
git status

# 2. Tambahkan semua perubahan
git add .

# 3. Commit dengan pesan yang jelas
git commit -m "Deskripsi singkat perubahan kamu"

# 4. Push ke GitHub
git push origin main
```

**Contoh pesan commit yang baik:**
```bash
git commit -m "Menambahkan fitur like pada thread"
git commit -m "Fix bug login gagal saat email kosong"
git commit -m "Update tampilan halaman settings"
git commit -m "Menambahkan kolom bio di tabel users"
```

---

## 🔄 Workflow Kolaborasi Sehari-hari

### Alur Kerja:

```
┌─────────────────────────────────────────────────┐
│             SEBELUM MULAI KERJA                 │
│                                                 │
│   git pull origin main    ← download update     │
│   php artisan migrate     ← jika ada migrasi    │
│                             baru dari rekan     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              NGODING / KERJA                    │
│                                                 │
│   ... edit file, tambah fitur, fix bug ...      │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│            SETELAH SELESAI KERJA                │
│                                                 │
│   git add .                                     │
│   git commit -m "deskripsi perubahan"           │
│   git push origin main    ← upload perubahan    │
└─────────────────────────────────────────────────┘
```

### Skenario 1: Update Kode Biasa (Tanpa Database)

**Yang push:**
```bash
git add .
git commit -m "Update tampilan Navbar"
git push origin main
```

**Yang pull:**
```bash
git pull origin main
```

---

### Skenario 2: Ada Migration Baru (Perubahan Database)

**Yang buat migration:**
```bash
php artisan make:migration add_bio_to_users_table
# Edit file migration-nya di backend/database/migrations/
php artisan migrate

git add .
git commit -m "Menambahkan kolom bio di users"
git push origin main
```

**Yang pull:**
```bash
git pull origin main
cd backend
php artisan migrate
```

> Laravel otomatis tahu migration mana yang sudah dan belum dijalankan.

---

### Skenario 3: Ada Package Baru

**Jika ada package backend baru (composer):**
```bash
git pull origin main
cd backend
composer install
```

**Jika ada package frontend baru (npm):**
```bash
git pull origin main
cd frontend
npm install
```

---

### Skenario 4: Reset Database ke Awal

Jika database berantakan dan ingin mulai dari awal:
```bash
cd backend
php artisan migrate:fresh --seed
```

> ⚠️ Perintah ini akan **menghapus semua data** dan mengisi ulang dari seeder.

---

## ⚠️ Mengatasi Conflict

Conflict terjadi jika **dua orang mengedit file yang sama di baris yang sama** secara bersamaan.

### Cara Mengatasi:

```bash
# 1. Pull perubahan terbaru
git pull origin main
# Muncul pesan: CONFLICT (content) di file tertentu

# 2. Buka file yang conflict di VS Code
# Cari tanda seperti ini:
```

```
<<<<<<< HEAD
// Kode kamu (versi lokal)
=======
// Kode rekan kerja (versi GitHub)
>>>>>>> origin/main
```

```bash
# 3. Pilih kode yang benar:
#    - Pilih kode kamu saja, ATAU
#    - Pilih kode rekan kerja saja, ATAU
#    - Gabungkan keduanya
# 4. Hapus tanda <<<<<<, =======, >>>>>>

# 5. Save file, lalu commit
git add .
git commit -m "Resolve conflict di NamaFile"
git push origin main
```

> 💡 **VS Code** punya fitur visual untuk resolve conflict. Saat buka file yang conflict, akan muncul tombol "Accept Current Change", "Accept Incoming Change", atau "Accept Both Changes".

---

## 📌 Perintah Git yang Sering Dipakai

| Perintah | Fungsi |
|----------|--------|
| `git pull origin main` | Download update terbaru dari GitHub |
| `git status` | Lihat file yang berubah |
| `git add .` | Tambahkan semua perubahan |
| `git commit -m "pesan"` | Simpan perubahan dengan deskripsi |
| `git push origin main` | Upload perubahan ke GitHub |
| `git log --oneline -10` | Lihat 10 commit terakhir |
| `git diff` | Lihat detail perubahan baris per baris |
| `git checkout -- namafile` | Batalkan perubahan yang belum di-commit |
| `git branch` | Lihat semua branch |
| `git stash` | Simpan perubahan sementara tanpa commit |

---

## 🔧 Troubleshooting

### ❌ Error: `could not find driver`
**Solusi:** Ekstensi `pdo_pgsql` belum aktif di PHP.
1. Cari file `php.ini` (jalankan `php --ini` untuk tahu lokasinya)
2. Buka file tersebut
3. Cari baris `;extension=pdo_pgsql` → hapus tanda `;` di depannya
4. Save dan restart terminal

### ❌ Error: `SQLSTATE connection refused`
**Solusi:** PostgreSQL belum berjalan atau password salah.
1. Pastikan PostgreSQL sudah running (cek di Services atau pgAdmin)
2. Cek ulang `DB_PASSWORD` di file `.env`

### ❌ Error: `npm ERR! code ENOENT`
**Solusi:** Kamu belum berada di folder yang benar.
```bash
cd frontend
npm install
```

### ❌ Error: `php artisan: command not found`
**Solusi:** PHP belum terinstall atau belum ditambahkan ke PATH environment variable.

### ❌ Error: `git push rejected`
**Solusi:** Ada perubahan di GitHub yang belum kamu download.
```bash
git pull origin main
# Resolve conflict jika ada
git push origin main
```

---

## 🛡️ Tips Kolaborasi

| Tips | Penjelasan |
|------|-----------|
| **Selalu `git pull` sebelum mulai kerja** | Hindari conflict dengan mendapat kode terbaru |
| **Commit sering, pesan jelas** | Lebih baik banyak commit kecil daripada 1 commit besar |
| **Koordinasi pembagian kerja** | "Aku edit Navbar, kamu edit Settings" → hindari edit file yang sama |
| **Jangan edit migration lama** | Kalau mau ubah tabel, buat migration BARU (`php artisan make:migration`) |
| **File `.env` tidak dishare** | Setiap orang punya password database sendiri, file `.env` tidak di-upload ke GitHub |
| **Jalankan `php artisan migrate` setelah pull** | Supaya database kamu ikut terupdate jika ada migration baru |

---

**📅 Terakhir diperbarui:** Maret 2026
