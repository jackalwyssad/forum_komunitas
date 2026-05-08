# 📌 Forum Komunitas — Dokumentasi Teknis Lengkap

[![Laravel](https://img.shields.io/badge/Laravel-10-red?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![PHP](https://img.shields.io/badge/PHP-8.1+-blue?logo=php)](https://php.net)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-local-336791?logo=postgresql)](https://postgresql.org)
[![MySQL](https://img.shields.io/badge/MySQL-hosting-orange?logo=mysql)](https://mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> Forum diskusi komunitas berbasis web, dibangun dengan **Laravel 10** sebagai REST API backend dan **React 18 + Vite** sebagai frontend SPA. Mendukung autentikasi OTP, threading balasan, sistem notifikasi, dan dark/light mode.

---

## 📑 Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Tech Stack](#tech-stack)
4. [Struktur Folder](#struktur-folder)
5. [Alur Autentikasi](#alur-autentikasi)
6. [Hubungan Antar File Backend](#hubungan-antar-file-backend)
7. [Skema Database & ERD](#skema-database--erd)
8. [API Endpoints Lengkap](#api-endpoints-lengkap)
9. [Alur Frontend](#alur-frontend)
10. [State Management (Context API)](#state-management-context-api)
11. [Instalasi & Setup](#instalasi--setup)
12. [Konfigurasi .env](#konfigurasi-env)
13. [Deployment & CI/CD](#deployment--cicd)
14. [Testing](#testing)
15. [Kontribusi & Git Workflow](#kontribusi--git-workflow)
16. [Penjelasan File per File](#penjelasan-file-per-file)

---

## 🌐 Gambaran Umum

**Forum Komunitas** adalah platform diskusi berbasis web yang memungkinkan pengguna untuk:
- Membuat dan merespons thread diskusi dengan topik berbeda-beda
- Melampirkan gambar pada thread maupun balasan
- Berinteraksi via sistem like dan notifikasi real-time
- Mengajukan kategori baru kepada admin untuk disetujui atau ditolak
- Menikmati tampilan gelap (dark mode) maupun terang (light mode)

Proyek ini dibangun sebagai **decoupled full-stack application** — backend Laravel hanya bertugas sebagai REST API (tidak merender HTML/view untuk user), sementara frontend React bertanggung jawab penuh atas tampilan dan navigasi.

---

## 🏗️ Arsitektur Sistem

`
┌─────────────────────────────────────────────────────────────┐
│                        PENGGUNA (Browser)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND  (React 18 + Vite SPA)                │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Pages   │  │  Components  │  │  Context (Auth/Theme)  │ │
│  └──────────┘  └──────────────┘  └────────────────────────┘ │
│                     ↓ Axios HTTP Call                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (JSON)
                      │ Authorization: Bearer <token>
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            BACKEND (Laravel 10 REST API)                    │
│  ┌──────────┐  ┌────────────┐  ┌───────────┐  ┌─────────┐  │
│  │  Routes  │→ │ Middleware │→ │Controllers│→ │ Models  │  │
│  │ api.php  │  │ (Sanctum)  │  │(Api/*.php)│  │Eloquent │  │
│  └──────────┘  └────────────┘  └───────────┘  └────┬────┘  │
└──────────────────────────────────────────────────────┼──────┘
                                                       │ Query
                                                       ▼
┌─────────────────────────────────────────────────────────────┐
│         DATABASE: PostgreSQL (lokal) / MySQL (hosting)      │
│  users | threads | replies | categories | likes | ...       │
└─────────────────────────────────────────────────────────────┘
                                                       │
┌─────────────────────────────────────────────────────────────┐
│              EMAIL SERVICE (SMTP via Blade Template)        │
│         OTP Verification | Password Reset                   │
└─────────────────────────────────────────────────────────────┘
`

### Alur Request Secara Umum

1. Pengguna membuka browser, React SPA di-load dari server (atau CDN).
2. React Router menentukan halaman mana yang ditampilkan berdasarkan URL.
3. Komponen halaman memanggil Axios ke endpoint Laravel API.
4. Axios interceptor otomatis menyisipkan header Authorization: Bearer <token>.
5. Laravel menerima request di 
outes/api.php, meneruskan ke Middleware Sanctum.
6. Jika token valid, request diteruskan ke Controller yang sesuai.
7. Controller berinteraksi dengan Model Eloquent untuk operasi database.
8. Controller mengembalikan JSON response.
9. React menerima response, memperbarui state, dan merender ulang UI.

---

## 🛠️ Tech Stack

### Backend
| Kategori | Teknologi | Keterangan |
|---|---|---|
| Framework | Laravel 10 | PHP framework untuk REST API |
| Runtime | PHP 8.1+ | Versi minimum PHP yang dibutuhkan |
| Database (lokal) | PostgreSQL | Database utama untuk development |
| Database (hosting) | MySQL | Database untuk production/hosting |
| Autentikasi | Laravel Sanctum | Token-based API authentication |
| Email | SMTP + Blade | Template email untuk OTP & reset password |
| File Storage | Laravel Storage | Penyimpanan avatar & gambar thread/reply |
| ORM | Eloquent | Object-Relational Mapping bawaan Laravel |

### Frontend
| Kategori | Teknologi | Keterangan |
|---|---|---|
| Framework | React 18 | Library UI berbasis komponen |
| Build Tool | Vite 5 | Bundler cepat untuk development & production |
| Styling | Vanilla CSS | CSS murni dengan Custom Properties (variabel) |
| HTTP Client | Axios | Library untuk melakukan HTTP request ke API |
| Routing | React Router v6 | Client-side routing untuk SPA |
| State Global | React Context API | Manajemen state autentikasi dan tema |

---

## 📁 Struktur Folder

`
Forum Komunitas/
├── README.md                            # Dokumentasi utama (file ini)
├── README_cara_kerja.md                 # Dokumentasi teknis mendalam
│
├── backend/                             # Laravel 10 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       ├── AuthController.php          # Register, Login, Logout, Profile
│   │   │   │       ├── PasswordResetController.php # Kirim & verifikasi reset password
│   │   │   │       ├── ThreadController.php        # CRUD thread + upload gambar
│   │   │   │       ├── ReplyController.php         # CRUD balasan + threaded reply
│   │   │   │       ├── CategoryController.php      # CRUD kategori (admin)
│   │   │   │       ├── CategoryRequestController.php # Pengajuan & approval kategori
│   │   │   │       └── NotificationController.php  # Ambil & tandai notifikasi
│   │   │   ├── Middleware/                          # Middleware kustom
│   │   │   ├── Requests/                            # Form Request validation
│   │   │   └── Resources/                           # API Resource transformer
│   │   ├── Models/
│   │   │   ├── User.php            # Model user dengan relasi threads, replies, likes
│   │   │   ├── Thread.php          # Model thread, cascade delete replies & images
│   │   │   ├── ThreadImage.php     # Model gambar yang dilampirkan ke thread
│   │   │   ├── Reply.php           # Model balasan, support parent_id (threaded)
│   │   │   ├── ReplyImage.php      # Model gambar yang dilampirkan ke reply
│   │   │   ├── Like.php            # Model like untuk thread
│   │   │   ├── Category.php        # Model kategori diskusi
│   │   │   ├── CategoryRequest.php # Model pengajuan kategori baru dari user
│   │   │   └── Notification.php    # Model notifikasi in-app
│   ├── database/
│   │   ├── migrations/             # Definisi skema tabel database
│   │   └── seeders/                # Data awal (seeder)
│   ├── resources/
│   │   └── views/
│   │       └── emails/
│   │           ├── otp-verification.blade.php  # Template email OTP registrasi
│   │           └── reset-password.blade.php     # Template email reset password
│   └── routes/
│       └── api.php                 # Definisi semua API route
│
└── frontend/                       # React 18 + Vite SPA
    ├── index.html                  # Entry HTML, mount point React
    └── src/
        ├── App.jsx                 # Root komponen, definisi semua routes
        ├── main.jsx                # Entry point, render App ke DOM
        ├── index.css               # Stylesheet global, CSS variables, dark mode
        ├── api/
        │   └── axios.js            # Instance Axios + interceptor token otomatis
        ├── components/
        │   ├── Alert.jsx           # Komponen alert/notifikasi global (Portal)
        │   ├── ConfirmDialog.jsx   # Dialog konfirmasi (hapus data dll)
        │   ├── Footer.jsx          # Footer aplikasi
        │   ├── Navbar.jsx          # Navigasi utama + badge notifikasi
        │   ├── OtpInput.jsx        # Input OTP 6 digit dengan divider
        │   ├── PasswordInput.jsx   # Input password dengan toggle show/hide
        │   └── ProtectedRoute.jsx  # Guard halaman yang butuh login
        ├── context/
        │   ├── AuthContext.jsx     # Global state: user, token, login, logout
        │   └── ThemeContext.jsx    # Global state: dark/light mode
        └── pages/
            ├── LandingPage.jsx             # Halaman beranda / hero
            ├── ThreadsPage.jsx             # Daftar semua thread + pagination
            ├── ThreadDetailPage.jsx        # Detail thread + balasan
            ├── CreateThreadPage.jsx        # Form buat thread baru
            ├── CategoriesPage.jsx          # Daftar kategori + ajukan kategori
            ├── AdminCategoriesPage.jsx     # Dashboard admin: kelola kategori & request
            ├── LoginPage.jsx               # Form login
            ├── RegisterPage.jsx            # Form registrasi + OTP
            ├── ForgotPasswordPage.jsx      # Form lupa password
            ├── ResetPasswordPage.jsx       # Form reset password
            ├── SettingsPage.jsx            # Pengaturan profil & password
            ├── NotificationsPage.jsx       # Daftar semua notifikasi
            └── NotFoundPage.jsx            # Halaman 404
`

---

## 🔐 Alur Autentikasi

### 5.1 Registrasi dengan OTP

Alur registrasi terdiri dari dua langkah terpisah yang dirancang untuk memverifikasi kepemilikan email sebelum membuat akun permanen.

**Langkah 1 — Kirim OTP (`POST /api/register/send-otp`):**

User mengisi formulir registrasi (nama, email, password) di halaman `RegisterPage.jsx`. Data dikirim ke backend. `AuthController@sendOtp` memvalidasi input, memastikan email belum terdaftar di tabel `users`, men-generate kode OTP 6 digit acak, lalu menyimpan data sementara ke tabel `email_otps` dengan masa berlaku 10 menit. Email berisi kode OTP dikirim menggunakan template Blade (`otp-verification.blade.php`) via SMTP.

**Langkah 2 — Verifikasi OTP (`POST /api/register/verify-otp`):**

User memasukkan kode OTP yang diterima di komponen `OtpInput.jsx`. `AuthController@verifyOtp` mencari record di `email_otps` berdasarkan email, memvalidasi kode OTP cocok dan belum kedaluwarsa (`expires_at > now()`), membuat User baru di tabel `users` menggunakan data dari `email_otps`, menghapus record OTP (single-use, tidak bisa dipakai lagi), membuat token Sanctum baru, dan mengembalikan `{user, token}`.

Frontend menerima token, menyimpan ke `localStorage`, memanggil `setUser()` di `AuthContext`, lalu redirect ke `/threads`.

**Mengapa dua langkah?** Karena email belum diverifikasi saat form diisi. OTP memastikan user benar-benar memiliki akses ke email yang didaftarkan sebelum akun dibuat secara permanen di database.

---

### 5.2 Alur Login

User mengisi email + password di `LoginPage.jsx`. Data dikirim ke `POST /api/login`. `AuthController@login` memvalidasi input menggunakan `LoginRequest`, memanggil `Auth::attempt({email, password})` yang secara otomatis melakukan verifikasi hash password. Jika gagal, mengembalikan 401. Jika berhasil, membuat token Sanctum baru dan mengembalikan `{user, token}`.

Frontend menyimpan token ke `localStorage`, mengupdate `AuthContext`, dan redirect ke halaman tujuan.

**Idle Session Timeout:** Frontend memantau aktivitas pengguna via event listener (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`). Jika tidak ada aktivitas selama 20 menit, `handleIdleLogout()` dipanggil yang akan logout dan redirect ke halaman login.

---

### 5.3 Logout

Frontend memanggil `POST /api/logout` dengan header `Authorization: Bearer <token>`. Middleware `auth:sanctum` memverifikasi token. `AuthController@logout` memanggil `$request->user()->currentAccessToken()->delete()` yang menghapus token dari tabel `personal_access_tokens`. Frontend menghapus `token` dan `user` dari `localStorage`, mengupdate state, dan redirect ke `/login`.

---

### 5.4 Reset Password

1. User mengisi email di `ForgotPasswordPage.jsx` → `POST /api/forgot-password`
2. Backend generate token unik (`Str::random(64)`), simpan hash-nya ke `password_reset_tokens`, kirim link reset via email
3. User klik link di email → diarahkan ke `ResetPasswordPage.jsx` → `GET /api/check-reset-token?token=X&email=Y`
4. Jika token valid (belum 60 menit), user mengisi password baru → `POST /api/reset-password`
5. Backend update password user, hapus record token, selesai

---

### 5.5 Cara Kerja Token Sanctum

Token Sanctum disimpan di tabel `personal_access_tokens`. Setiap request ke endpoint protected harus menyertakan header:

```
Authorization: Bearer 1|AbCdEfGhIjKlMnOpQrStUvWxYz...
```

Proses verifikasi oleh middleware `auth:sanctum`:
1. Baca header `Authorization`
2. Ekstrak plain-text token
3. Lakukan hash SHA-256 pada token
4. Cari hasil hash di kolom `token` pada `personal_access_tokens`
5. Jika ditemukan dan belum expired → request dilanjutkan, `$request->user()` tersedia
6. Jika tidak ditemukan → return 401 Unauthorized

---

## 🔗 Hubungan Antar File Backend

### Alur Request Umum

```
HTTP Request
    |
    v
routes/api.php         <- URL mapping ke Controller
    |
    v
Middleware Stack       <- Di-setup di Kernel.php
  - throttle:api       <- Rate limiting (cegah spam request)
  - auth:sanctum       <- Verifikasi Bearer token (route protected saja)
    |
    v
Form Request           <- Validasi input otomatis (LoginRequest, RegisterRequest, dll)
    |
    v
Controller             <- Logika bisnis utama
  - Panggil Model Eloquent
  - Proses file upload
  - Kirim email jika perlu
  - Buat notifikasi
    |
    v
Model Eloquent         <- Representasi tabel, relasi hasMany/belongsTo
    |
    v
API Resource           <- Transform data Model ke format JSON response
    |
    v
JSON Response ke Frontend
```

### Contoh: Membuat Thread Baru

```
POST /api/threads
Header: Authorization: Bearer <token>
Body: {title, content, category_id, images[]}

1. routes/api.php
   Route::post('/threads', [ThreadController::class, 'store'])
   -> Middleware: auth:sanctum (cek token dulu)

2. ThreadController@store
   -> Validasi: title wajib min 3 karakter, content wajib, category_id valid UUID
   -> Thread::create([title, content, user_id=$request->user()->id, category_id, status='published'])
   -> Jika ada gambar: Storage::disk('public')->put('thread-images/...', $file)
   -> ThreadImage::create([thread_id, path])
   -> Return JSON: {message, thread: {...with user, category, images...}}

3. Thread Model (app/Models/Thread.php)
   -> Relasi: belongsTo(User), belongsTo(Category)
   -> hasMany(Reply), hasMany(Like), hasMany(ThreadImage)
   -> Boot method: cascade delete semua data terkait saat thread dihapus
```

### Contoh: Balasan Threaded dengan @Mention

```
POST /api/threads/{thread}/replies
Body: {content: "...", parent_id: "uuid-reply-yang-dibalas"}

1. ReplyController@store
   -> Validasi input
   -> Reply::create([content, user_id, thread_id, parent_id])
   -> Jika parent_id = null:
        Notifikasi ke pemilik THREAD (kecuali user = pemilik thread)
        type: "reply_thread"
   -> Jika parent_id ada:
        Notifikasi ke pemilik REPLY PARENT (kecuali user = pemilik reply parent)
        type: "reply_reply"
   -> Simpan gambar jika ada

2. Reply Model (app/Models/Reply.php)
   -> belongsTo(Reply, 'parent_id') // parent
   -> hasMany(Reply, 'parent_id')   // children
   -> Boot method: recursive delete children saat reply dihapus
```

---

## 🗄️ Skema Database & ERD

### Tabel-Tabel Database

**users** — Data akun pengguna
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID PK | Primary key UUID |
| name | string | Nama lengkap |
| email | string UNIQUE | Email login |
| password | string | Bcrypt hash |
| role | enum(admin,user) | Default: user |
| avatar | string NULL | Path foto profil |
| email_verified_at | timestamp NULL | Waktu verifikasi |

**email_otps** — Data sementara registrasi (dihapus setelah OTP diverifikasi)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | bigint PK | Auto increment |
| name | string | Nama calon user |
| email | string INDEX | Email calon user |
| password | string | Password di-hash sementara |
| otp | string(6) | Kode OTP 6 digit |
| expires_at | timestamp | Kedaluwarsa (+10 menit) |

**threads** — Thread/diskusi utama
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID PK | - |
| title | string | Judul thread |
| content | text | Isi thread |
| user_id | UUID FK→users | Pembuat |
| category_id | UUID FK→categories | Kategori |
| status | string | published, dll |

**replies** — Balasan (support threaded via parent_id)
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID PK | - |
| content | text | Isi balasan |
| user_id | UUID FK→users | Pembuat |
| thread_id | UUID FK→threads | Thread induk |
| parent_id | UUID NULL FK→replies | Jika ada = reply dari reply |

**notifications** — Notifikasi in-app
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID PK | - |
| user_id | UUID FK→users | Penerima notifikasi |
| sender_id | UUID FK→users | Pemicu notifikasi |
| type | string | reply_thread, reply_reply, category_request_update |
| message | text | Teks notifikasi |
| thread_id | UUID NULL | Thread terkait |
| reply_id | UUID NULL set-null | Reply terkait |
| read_at | timestamp NULL | NULL = belum dibaca |

**category_requests** — Pengajuan kategori dari user
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | UUID PK | - |
| user_id | UUID FK→users | Pengaju |
| name | string | Nama usulan kategori |
| description | text NULL | Deskripsi usulan |
| status | string | pending / approved / rejected |
| admin_note | text NULL | Catatan penolakan dari admin |

### Diagram ERD

```
USERS (1) ──────< THREADS (many)
  |                    |
  |            ┌───────┤
  |            |       |
  |          THREAD_IMAGES   REPLIES (many, self-ref via parent_id)
  |                          |
  |                      REPLY_IMAGES
  |
  +─────< LIKES (many)
  |
  +─────< CATEGORY_REQUESTS (many)
  |
  +─────< NOTIFICATIONS [user_id penerima, sender_id pengirim]

CATEGORIES (1) ──< THREADS (many)
```

---

## 📡 API Endpoints Lengkap

Base URL: `http://localhost:8000/api`

### Autentikasi

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | /register/send-otp | Publik | Kirim OTP ke email untuk registrasi |
| POST | /register/verify-otp | Publik | Verifikasi OTP, buat akun, return token |
| POST | /login | Publik | Login email+password, return token |
| POST | /logout | Token | Hapus token aktif |
| GET | /me | Token | Data user yang sedang login |
| POST | /forgot-password | Publik | Kirim link reset password |
| GET | /check-reset-token | Publik | Validasi token reset (query: token, email) |
| POST | /reset-password | Publik | Reset password baru |

### Profil

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| PUT | /profile | Token | Update nama / email |
| PUT | /profile/password | Token | Ganti password |
| POST | /profile/avatar | Token | Upload foto profil (multipart/form-data) |
| DELETE | /profile/avatar | Token | Hapus foto profil |

### Kategori

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | /categories | Publik | Daftar kategori publik |
| GET | /categories/{id} | Publik | Detail satu kategori |
| POST | /categories | Admin | Buat kategori baru |
| PUT | /categories/{id} | Admin | Update kategori |
| DELETE | /categories/{id} | Admin | Hapus kategori |

### Thread

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | /threads | Publik | Daftar thread (pagination, filter, search) |
| GET | /threads/{id} | Publik | Detail thread + semua replies |
| POST | /threads | Token | Buat thread baru (support upload gambar) |
| PUT | /threads/{id} | Token | Edit thread (pemilik atau admin) |
| DELETE | /threads/{id} | Token | Hapus thread (cascade delete) |
| POST | /threads/{id}/like | Token | Toggle like atau unlike thread |

### Reply

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | /threads/{thread}/replies | Token | Buat balasan (parent_id opsional) |
| PUT | /replies/{id} | Token | Edit balasan |
| DELETE | /replies/{id} | Token | Hapus balasan + semua children |

### Notifikasi

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | /notifications | Token | Semua notifikasi milik user |
| GET | /notifications/unread-count | Token | Jumlah notifikasi belum dibaca |
| PUT | /notifications/{id}/read | Token | Tandai satu notifikasi dibaca |
| PUT | /notifications/read-all | Token | Tandai semua notifikasi dibaca |

### Pengajuan Kategori

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | /category-requests | Token | Daftar pengajuan (admin: semua, user: miliknya) |
| POST | /category-requests | Token | Ajukan kategori baru |
| POST | /category-requests/{id}/approve | Admin | Setujui pengajuan, buat kategori |
| POST | /category-requests/{id}/reject | Admin | Tolak pengajuan dengan catatan |



---

## 💻 9. Alur Frontend

Frontend dibangun menggunakan React 18 dan Vite sebagai bundler, dengan SPA (Single Page Application) routing menggunakan React Router v6.

### 9.1 Alur Navigasi Utama (Pages)

1. **User belum login** membuka web -> diarahkan ke `LandingPage.jsx`.
2. Jika user mencoba mengakses halaman terproteksi (seperti `/threads/create`), komponen `<ProtectedRoute>` akan mengecek state `isAuthenticated` dari `AuthContext`. Jika false, user akan diarahkan ke `/login`.
3. **Login / Register**: Melalui komponen `LoginPage.jsx` atau `RegisterPage.jsx`. Registrasi diarahkan untuk verifikasi OTP.
4. **Halaman Utama Diskusi**: Setelah login (atau sebagai tamu), halaman `/threads` (`ThreadsPage.jsx`) menampilkan daftar diskusi.
5. **Detail Diskusi**: Klik pada sebuah thread mengarahkan ke `/threads/:id` (`ThreadDetailPage.jsx`) yang merender komponen thread dan daftar `replies` di bawahnya.
6. **Dashboard Admin**: Admin memiliki akses ke `/admin/categories` (`AdminCategoriesPage.jsx`) untuk mengelola kategori publik dan menyetujui/menolak pengajuan kategori.

### 9.2 Interaksi Komponen & API Call (Contoh: Menampilkan Detail Thread)

```
[User] Klik Thread 
  |
  v
[ThreadDetailPage.jsx]
  |-- 1. useEffect() berjalan saat komponen dimount
  |-- 2. Memanggil fungsi fetchThread(id) dari api/axios.js
  |-- 3. axios.get('/api/threads/' + id) dikirim ke backend
  |-- 4. Menunggu response JSON
  |-- 5. Jika sukses: setThread(response.data)
  |-- 6. State berubah, React me-render ulang komponen UI
  |-- 7. Menampilkan judul, konten, gambar, dan daftar balasan
```

### 9.3 Pengunggahan Gambar (Optimistic & Background Upload)

Pembuatan thread dengan gambar dirancang untuk tidak memblokir UI terlalu lama:
1. User memilih gambar.
2. Saat submit, frontend memanggil API untuk membuat thread *tanpa* menunggu seluruh gambar selesai di-upload (Optimistic creation).
3. Thread segera tampil di layar, namun status upload gambar diproses di background.
4. UI menampilkan indikator loading pada thread yang bersangkutan sampai gambar benar-benar tersimpan di backend.

---

## 🗃️ 10. State Management (Context API)

Aplikasi ini menggunakan **React Context API** untuk manajemen state global, menghindari *prop-drilling* (mengoper data berjenjang terlalu dalam). Terdapat dua context utama:

### 10.1 AuthContext (`src/context/AuthContext.jsx`)
Mengelola state autentikasi seluruh aplikasi:
- `user`: Menyimpan data user yang sedang login (ID, nama, email, role, avatar). Di-inisialisasi dari `localStorage`.
- `login()`: Fungsi untuk memanggil endpoint API login, menyimpan token ke `localStorage`, dan mengupdate state `user`.
- `logout()`: Memanggil API logout, menghapus data dari `localStorage`, dan membersihkan state.
- `isAuthenticated`: Boolean (true jika `user` tidak null).
- `isAdmin`: Boolean (true jika `user.role === 'admin'`).

### 10.2 ThemeContext (`src/context/ThemeContext.jsx`)
Mengelola mode tampilan gelap/terang (Dark/Light Mode):
- `theme`: Menyimpan preferensi tema ('light' atau 'dark').
- `toggleTheme()`: Mengubah state `theme`.
- Efek samping: Menyimpan preferensi ke `localStorage` dan menambahkan atribut `data-theme="dark"` ke tag `<html>` pada DOM untuk memicu CSS variables mode gelap.

---

## ⚙️ 11. Instalasi & Setup

### Persyaratan Sistem
- PHP 8.1 atau lebih baru
- Composer 2.x
- Node.js 18.x atau lebih baru
- PostgreSQL (Lokal) atau MySQL

### 11.1 Setup Backend (Laravel)

1. **Clone repositori dan masuk ke folder backend:**
   ```bash
   git clone https://github.com/jackalwyssad/forum_komunitas.git
   cd forum_komunitas/backend
   ```

2. **Instal dependensi PHP:**
   ```bash
   composer install
   ```

3. **Salin file konfigurasi environment:**
   ```bash
   cp .env.example .env
   ```

4. **Konfigurasi Database & Mail di `.env`** (Lihat bagian 12).

5. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

6. **Jalankan Migrasi & Seeder Database:**
   ```bash
   php artisan migrate:fresh --seed
   ```

7. **Link Storage (Untuk gambar/avatar):**
   ```bash
   php artisan storage:link
   ```

8. **Jalankan Development Server:**
   ```bash
   php artisan serve
   ```
   *(Backend akan berjalan di `http://localhost:8000`)*

### 11.2 Setup Frontend (React)

1. **Masuk ke folder frontend:**
   ```bash
   cd ../frontend
   ```

2. **Instal dependensi Node:**
   ```bash
   npm install
   ```

3. **Buat file `.env` (opsional jika endpoint API sama dengan default):**
   ```bash
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   *(Frontend akan berjalan di `http://localhost:5173`)*

---

## 📝 12. Konfigurasi .env

### Backend (`.env`)

```env
# URL dan Environment
APP_NAME="Forum Komunitas"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173  # Penting untuk CORS dan link reset password

# Database (PostgreSQL untuk lokal)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=forum_komunitas
DB_USERNAME=postgres
DB_PASSWORD=secret

# SMTP Email Configuration (Wajib untuk OTP & Reset Password)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=email_anda@gmail.com
MAIL_PASSWORD=app_password_gmail_anda
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@forumkomunitas.com
MAIL_FROM_NAME="${APP_NAME}"

# Sanctum CORS config
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost
```

### Frontend (`.env`)

```env
# URL dasar untuk request API (ditangani di axios interceptor)
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 13. Deployment & CI/CD

Proyek ini menggunakan otomatisasi deployment menggunakan GitHub Actions ke server cPanel via FTP.

### 13.1 Skema Deployment

```
[Developer Push Code ke GitHub (main)] 
    |
    v
[GitHub Actions Triggered (.github/workflows/deploy.yml)]
    |-- 1. Setup PHP & Node.js
    |-- 2. Build Frontend (npm run build)
    |-- 3. Install Backend Dependencies (composer install --no-dev)
    |-- 4. Sinkronisasi File ke Hosting cPanel via FTP (FTP-Deploy-Action)
           (PENTING: Ignore folder /storage/app/public agar file user tidak tertimpa)
    |-- 5. Trigger Secret API Route untuk Migrasi Database
```

### 13.2 Menjalankan Migrasi secara Otomatis

Karena cPanel shared hosting terkadang tidak memiliki akses SSH yang leluasa, otomatisasi migrasi dilakukan dengan membuat endpoint khusus:

```php
// routes/api.php
Route::post('/deploy/run-migrations', function (Request $request) {
    if ($request->input('token') !== env('DEPLOY_TOKEN')) {
         return response()->json(['message' => 'Unauthorized'], 401);
    }
    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('optimize:clear');
    return response()->json(['message' => 'Deploy tasks completed!']);
});
```

GitHub actions melakukan HTTP request POST ke endpoint ini di akhir siklus deploy dengan menyertakan token autentikasi khusus, sehingga skema database selalu mutakhir.

---

## 🧪 14. Testing (Pengujian)

(Jika Anda ingin menambahkan pengujian ke depannya, ini adalah struktur yang disarankan)

### Backend Testing (Pest / PHPUnit)
Digunakan untuk menguji REST API dan validasi.
- **Jalankan test:** `php artisan test`
- File pengujian berada di `/tests/Feature/` dan `/tests/Unit/`.

### Frontend Testing (Vitest / React Testing Library)
- **Jalankan test:** `npm run test`

---

## 🤝 15. Kontribusi & Git Workflow

### 15.1 Git Workflow

1. **Main Branch:** Branch `main` hanya berisi kode yang stabil dan siap-deploy (production-ready).
2. **Feature Branches:** Setiap fitur baru harus dibuat di branch baru.
   ```bash
   git checkout -b feature/tambah-sistem-rating
   ```
3. Lakukan commit dengan pesan yang jelas (menggunakan *Conventional Commits*).
   - `feat: tambah sistem OTP untuk register`
   - `fix: modal z-index tertimpa navbar`
4. Push ke GitHub dan buat Pull Request (PR) ke branch `main`.

---

## 📄 16. Penjelasan File per File (Singkat)

Berikut adalah rekap penjelasan fungsi file penting (Komentar bahasa Indonesia telah disematkan di dalam *source code* secara langsung):

### Backend (`/backend/app/`)
- **`Http/Controllers/Api/AuthController.php`**: Mengontrol login, pembuatan OTP register, verifikasi OTP, logout, dan manajemen profil.
- **`Http/Controllers/Api/ThreadController.php`**: Mengontrol logika CRUD untuk diskusi (Thread) serta penyimpanan file gambar yang dilampirkan.
- **`Http/Controllers/Api/CategoryRequestController.php`**: Menangani pengajuan kategori baru dari user biasa dan proses persetujuannya oleh Admin.
- **`Models/Thread.php`**: Mendefinisikan struktur objek thread dan relasi. Bagian terpenting adalah *boot method* yang men-trigger *cascade delete* pada `replies` saat `thread` dihapus.
- **`routes/api.php`**: Peta jalan semua endpoint API yang ada di aplikasi ini. Memisahkan *public route* dan *protected route* (middleware auth).

### Frontend (`/frontend/src/`)
- **`App.jsx`**: Mendefinisikan semua routing halaman (*React Router*) dan membungkus aplikasi dengan *Context Providers*.
- **`api/axios.js`**: Instance khusus untuk Axios yang secara otomatis menyisipkan token Sanctum ke header pada setiap HTTP Request (menggunakan Interceptor).
- **`context/AuthContext.jsx`**: Berisi *state* global user (token & data diri) serta fungsi `login` dan `logout`. Menangani timer *Idle Timeout* 20 menit.
- **`pages/ThreadDetailPage.jsx`**: Halaman kompleks yang menangani fetch data satu thread beserta seluruh balasannya (termasuk *nested reply*).
- **`components/Alert.jsx`**: Komponen UI global (menggunakan *React Portal*) untuk menampilkan pop-up pesan sukses/error (z-index diset tinggi agar selalu di atas).

---
*(Dokumentasi ini ditulis untuk memberikan pedoman menyeluruh mengenai arsitektur, basis data, API, dan standar pengkodean pada proyek Forum Komunitas.)*
