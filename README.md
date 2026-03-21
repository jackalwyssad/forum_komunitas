# 🗣️ Forum Komunitas

Aplikasi **Forum Diskusi** berbasis web full-stack yang dibangun menggunakan **Laravel 10** (Backend REST API) dan **React + Vite** (Frontend SPA). Forum ini memiliki fitur lengkap mulai dari autentikasi, CRUD threads, threaded replies dengan @mention, sistem like, notifikasi real-time, dark/light mode, hingga manajemen profil dan avatar.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Folder Project](#-struktur-folder-project)
- [Detail File & Fungsinya (Deep Dive)](#-detail-file--fungsinya-deep-dive)
  - [Backend (Laravel)](#1-backend-laravel)
  - [Frontend (React)](#2-frontend-react)
- [API Endpoint Reference](#-api-endpoint-reference)
- [Instalasi & Setup](#-instalasi--setup)
- [Akun Default](#-akun-default)
- [Catatan Teknis (Arsitektur)](#-catatan-teknis-arsitektur)

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Otorisasi
- **Register** — Registrasi akun baru dengan validasi nama, email unik, dan password minimal 8 karakter.
- **Login** — Login dengan email dan password, menghasilkan token API (Laravel Sanctum).
- **Logout** — Menghapus token aktif sehingga sesi berakhir.
- **Role-Based Access** — Dua role: `admin` dan `user`. Admin memiliki akses kelola kategori dan hapus konten milik siapapun.
- **Protected Routes** — Halaman tertentu hanya dapat diakses setelah login (frontend & backend).

### 💬 Threads (Diskusi)
- **Buat Thread** — Membuat diskusi baru dengan judul, konten, dan kategori.
- **Lihat Daftar Thread** — Halaman utama menampilkan semua threads dengan pagination.
- **Detail Thread** — Melihat konten lengkap thread beserta semua balasan.
- **Edit Thread** — Pemilik thread dapat mengedit judul, konten, dan kategori.
- **Hapus Thread** — Pemilik atau admin dapat menghapus thread (cascade menghapus semua replies, likes, dan notifikasi terkait).

### 💬 Replies (Balasan) dengan Threaded @Mention
- **Balas Thread** — Menulis balasan langsung ke thread.
- **Balas Reply (Threaded)** — Membalas komentar spesifik seseorang dengan indikator `↩ Membalas @NamaUser`.
- **@Mention** — Saat klik tombol "Balas" di reply, otomatis muncul badge `Membalas @NamaUser` di form.
- **Edit Reply** — Pemilik balasan dapat mengedit kontennya.
- **Hapus Reply (Cascade)** — Menghapus reply juga menghapus semua child replies (balasan bersarang) dan notifikasi terkait secara rekursif.

### ❤️ Like System
- **Toggle Like** — User bisa like/unlike thread dengan satu klik.
- **Like Count** — Setiap thread menampilkan jumlah likes.

### 🔔 Notifikasi
- **Notifikasi Otomatis** — Muncul saat ada balasan di thread kamu atau seseorang membalas komentar kamu.
- **Badge Unread** — Navbar menampilkan jumlah notifikasi belum dibaca dengan badge berdenyut.
- **Mark as Read** — Menandai notifikasi sebagai sudah dibaca (individual atau semua sekaligus).

### 🌗 Dark/Light Mode
- **Toggle Theme** — Switch antara mode gelap dan terang.
- **Persistent** — Preferensi tema disimpan di `localStorage`.

### 👤 Profil User
- **Edit Profil** — Ubah nama dan email.
- **Upload Avatar** — Upload foto profil ke server.
- **Ganti Password** — Ubah password dengan validasi password lama.

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Laravel 10 (PHP 8.1+) |
| **Frontend** | React 18 + Vite |
| **Database** | PostgreSQL |
| **Authentication** | Laravel Sanctum (Token-based API) |
| **Styling** | Vanilla CSS dengan CSS Custom Properties |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **State Management** | React Context API |
| **UUID** | Semua primary key menggunakan UUID v4 |

---

## 📂 Struktur Folder Project

```
Forum Diskusi/
├── README.md                          # Dokumentasi project
├── .gitignore                         # File yang diabaikan Git
│
├── backend/                           # Laravel 10 REST API
│   ├── app/
│   │   ├── Console/
│   │   │   └── Kernel.php
│   │   ├── Exceptions/
│   │   │   └── Handler.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Controller.php
│   │   │   │   └── Api/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── ThreadController.php
│   │   │   │       ├── ReplyController.php
│   │   │   │       ├── CategoryController.php
│   │   │   │       └── NotificationController.php
│   │   │   ├── Kernel.php
│   │   │   ├── Middleware/
│   │   │   │   ├── Authenticate.php
│   │   │   │   ├── EncryptCookies.php
│   │   │   │   ├── PreventRequestsDuringMaintenance.php
│   │   │   │   ├── RedirectIfAuthenticated.php
│   │   │   │   ├── TrimStrings.php
│   │   │   │   ├── TrustHosts.php
│   │   │   │   ├── TrustProxies.php
│   │   │   │   ├── ValidateSignature.php
│   │   │   │   └── VerifyCsrfToken.php
│   │   │   ├── Requests/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   ├── UpdateProfileRequest.php
│   │   │   │   ├── ChangePasswordRequest.php
│   │   │   │   ├── StoreThreadRequest.php
│   │   │   │   ├── UpdateThreadRequest.php
│   │   │   │   ├── StoreReplyRequest.php
│   │   │   │   ├── StoreCategoryRequest.php
│   │   │   │   └── UpdateCategoryRequest.php
│   │   │   └── Resources/
│   │   │       ├── UserResource.php
│   │   │       ├── ThreadResource.php
│   │   │       ├── ReplyResource.php
│   │   │       ├── CategoryResource.php
│   │   │       └── NotificationResource.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Thread.php
│   │   │   ├── Reply.php
│   │   │   ├── Like.php
│   │   │   ├── Category.php
│   │   │   └── Notification.php
│   │   └── Providers/
│   │       ├── AppServiceProvider.php
│   │       ├── AuthServiceProvider.php
│   │       ├── BroadcastServiceProvider.php
│   │       ├── EventServiceProvider.php
│   │       └── RouteServiceProvider.php
│   ├── config/
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── filesystems.php
│   │   ├── sanctum.php
│   │   └── ... (file config lainnya)
│   ├── database/
│   │   ├── factories/
│   │   │   └── UserFactory.php
│   │   ├── migrations/
│   │   │   ├── 2024_01_01_000001_create_users_table.php
│   │   │   ├── 2024_01_01_000002_create_categories_table.php
│   │   │   ├── 2024_01_01_000003_create_threads_table.php
│   │   │   ├── 2024_01_01_000004_create_replies_table.php
│   │   │   ├── 2024_01_01_000005_create_likes_table.php
│   │   │   ├── 2024_01_01_000006_add_avatar_to_users_table.php
│   │   │   ├── 2024_01_01_000007_add_parent_id_to_replies_table.php
│   │   │   └── 2024_01_01_000008_create_notifications_table.php
│   │   └── seeders/
│   │       └── DatabaseSeeder.php
│   ├── routes/
│   │   ├── api.php
│   │   ├── web.php
│   │   ├── channels.php
│   │   └── console.php
│   ├── .env.example
│   ├── composer.json
│   └── artisan
│
└── frontend/                          # React 18 + Vite SPA
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        └── pages/
            ├── ThreadsPage.jsx
            ├── ThreadDetailPage.jsx
            ├── CreateThreadPage.jsx
            ├── CategoriesPage.jsx
            ├── AdminCategoriesPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── SettingsPage.jsx
            └── NotificationsPage.jsx
```

---

## 📁 Detail File & Fungsinya (Deep Dive)

Berikut adalah daftar **semua** file kodingan beserta fungsinya secara mendalam:

### 1. Backend (Laravel)

#### 🎮 Controllers (`app/Http/Controllers/`)

| File | Fungsi |
|------|--------|
| **`Controller.php`** | Base controller bawaan Laravel. Menggunakan trait `AuthorizesRequests` dan `ValidatesRequests` yang diwariskan ke semua controller lain. |
| **`Api/AuthController.php`** | Mengatur seluruh logika autentikasi (Login, Register, Logout), manajemen profil (Update Nama/Email, Ganti Password), serta pengelolaan Avatar (Upload ke storage, Hapus file lama saat diganti). |
| **`Api/ThreadController.php`** | Menangani operasi CRUD untuk Thread. Termasuk logika pencarian (`search`), filter per kategori (`category_id`), pagination, serta fitur Like/Unlike thread (`toggleLike`). |
| **`Api/ReplyController.php`** | Mengelola pembuatan, edit, dan hapus balasan (replies). Di sini terdapat logika **notifikasi otomatis**: memberi tahu pemilik thread jika ada balasan baru, atau memberi tahu pengirim komentar asal jika dibalas (@mention via `parent_id`). |
| **`Api/NotificationController.php`** | Mengelola sistem notifikasi: mengambil daftar notifikasi user (`index`), menghitung jumlah notifikasi belum dibaca (`unreadCount`), menandai satu notifikasi sebagai sudah dibaca (`markAsRead`), dan menandai semua sebagai sudah dibaca (`markAllAsRead`). |
| **`Api/CategoryController.php`** | Mengelola daftar kategori diskusi (CRUD). Hanya admin yang memiliki akses untuk membuat, mengubah, atau menghapus kategori. User biasa hanya bisa melihat (`index`, `show`). |

#### 📝 Validation Requests (`app/Http/Requests/`)

| File | Fungsi |
|------|--------|
| **`LoginRequest.php`** | Validasi data login: email wajib format email, password wajib diisi. |
| **`RegisterRequest.php`** | Validasi data registrasi: nama wajib, email harus unik di tabel users, password minimal 8 karakter dan wajib dikonfirmasi. |
| **`UpdateProfileRequest.php`** | Validasi perubahan profil: email tetap harus unik (kecuali email milik user sendiri), nama wajib diisi, format valid. |
| **`ChangePasswordRequest.php`** | Validasi ganti password: `current_password` wajib, `password` baru minimal 8 karakter dan wajib dikonfirmasi (`password_confirmation`). |
| **`StoreThreadRequest.php`** | Validasi buat thread baru: `title` wajib diisi (max 255 karakter), `content` wajib, `category_id` harus UUID yang ada di tabel categories. |
| **`UpdateThreadRequest.php`** | Validasi edit thread: sama seperti `StoreThreadRequest`, memastikan data yang diubah tetap valid. |
| **`StoreReplyRequest.php`** | Validasi buat reply: `content` wajib, `thread_id` harus valid, `parent_id` opsional (untuk membalas reply lain). |
| **`StoreCategoryRequest.php`** | Validasi buat kategori: `name` wajib dan harus unik di tabel categories, `description` opsional (max 1000 karakter). |
| **`UpdateCategoryRequest.php`** | Validasi edit kategori: `name` wajib dan unik (kecuali nama kategori yang sedang di-edit sendiri), `description` opsional. Hanya user dengan role admin yang di-authorize. |

#### 💎 API Resources (`app/Http/Resources/`)

| File | Fungsi |
|------|--------|
| **`UserResource.php`** | Memformat data user (ID, Nama, Email, Role, URL Avatar) menjadi JSON yang konsisten untuk dikirim ke frontend. |
| **`ThreadResource.php`** | Menggabungkan data thread dengan informasi penulisnya (`user`), kategori, jumlah replies (`replies_count`), jumlah likes (`likes_count`), dan status apakah user yang sedang login sudah me-like thread tersebut (`is_liked`). |
| **`ReplyResource.php`** | Memformat balasan agar menyertakan info penulis (`user`) dan info "reply_to" — yaitu user yang dibalas — untuk menampilkan fitur @mention di frontend. |
| **`NotificationResource.php`** | Memformat pesan notifikasi agar dinamis. Menampilkan nama pengirim (`sender`), info thread terkait, dan tipe notifikasi (reply ke thread atau reply ke komentar). |
| **`CategoryResource.php`** | Menampilkan nama kategori, deskripsi, dan jumlah thread di dalamnya (`threads_count`). |

#### 🗄️ Models (`app/Models/`)

| File | Fungsi |
|------|--------|
| **`User.php`** | Representasi tabel `users`. Menggunakan trait `HasUuids` (UUID sebagai primary key), `HasApiTokens` (Sanctum token authentication), dan `HasFactory`. Memiliki method `isAdmin()` untuk cek role. Password otomatis di-hash via `$casts`. |
| **`Thread.php`** | Representasi tabel `threads`. Memiliki relasi ke `User` (penulis), `Category`, `Reply`, dan `Like`. Mempunyai logika `boot()` yang men-trigger **cascade delete** — saat thread dihapus, semua replies, likes, dan notifikasi terkait ikut terhapus otomatis. |
| **`Reply.php`** | Representasi tabel `replies`. Mendukung **struktur pohon** (parent/child) via kolom `parent_id` untuk balasan bersarang. Memiliki logika **recursive delete** — saat sebuah reply dihapus, semua child replies (balasan dari balasan) ikut terhapus secara rekursif. |
| **`Like.php`** | Model sederhana yang mencatat relasi many-to-many antara User dan Thread (siapa me-like thread apa). Memiliki relasi `belongsTo` ke User dan Thread. |
| **`Category.php`** | Model untuk pengelompokan diskusi. Satu kategori bisa memiliki banyak thread (`hasMany`). Mendukung UUID sebagai primary key. |
| **`Notification.php`** | Model yang menyimpan data notifikasi. Memiliki relasi ke `sender` (user yang melakukan aksi), `receiver` (user yang menerima notifikasi), `thread`, dan `reply`. Kolom `is_read` untuk menandai status baca. |

#### 🛡️ Middleware (`app/Http/Middleware/`)

| File | Fungsi |
|------|--------|
| **`Authenticate.php`** | Mengatur respons saat user belum terautentikasi. Untuk request API, mengembalikan response JSON `401 Unauthorized` alih-alih redirect ke halaman login. |
| **`EncryptCookies.php`** | Middleware bawaan Laravel untuk mengenkripsi semua cookie yang dikirim ke browser demi keamanan. |
| **`PreventRequestsDuringMaintenance.php`** | Mencegah request masuk saat aplikasi dalam mode maintenance (`php artisan down`). Bisa mengecualikan URI tertentu. |
| **`RedirectIfAuthenticated.php`** | Mengarahkan user yang sudah login jika mencoba mengakses halaman guest-only (seperti login/register). |
| **`TrimStrings.php`** | Otomatis menghapus spasi di awal dan akhir semua input string yang masuk. Mengecualikan field `password` dan `password_confirmation`. |
| **`TrustHosts.php`** | Mengatur daftar host yang dipercaya aplikasi untuk mencegah serangan host header injection. |
| **`TrustProxies.php`** | Mengkonfigurasi trusted proxy agar aplikasi bekerja dengan benar di belakang load balancer/reverse proxy (header `X-Forwarded-*`). |
| **`ValidateSignature.php`** | Memvalidasi URL yang di-signed (ditandatangani) agar tidak dimanipulasi. Mengecualikan parameter tertentu dari validasi. |
| **`VerifyCsrfToken.php`** | Middleware proteksi CSRF (Cross-Site Request Forgery) untuk request web. Bisa mengecualikan URI tertentu dari verifikasi CSRF. |

#### ⚙️ HTTP Kernel (`app/Http/Kernel.php`)

File **`Kernel.php`** adalah pusat registrasi semua middleware. Mengatur:
- **Global Middleware** — Middleware yang dijalankan di setiap request (TrustProxies, HandleCors, TrimStrings, dll).
- **Middleware Groups** — Grup middleware untuk `web` (session, CSRF, cookies) dan `api` (throttle, route binding).
- **Middleware Aliases** — Alias singkat untuk middleware (contoh: `auth` → `Authenticate.php`, `guest` → `RedirectIfAuthenticated.php`).

#### 🔧 Service Providers (`app/Providers/`)

| File | Fungsi |
|------|--------|
| **`AppServiceProvider.php`** | Provider utama untuk mendaftarkan service ke Laravel container. Saat ini kosong (default), bisa diisi konfigurasi global seperti pagination default atau model strict mode. |
| **`AuthServiceProvider.php`** | Mendaftarkan kebijakan otorisasi (policies) dan gates. Mengatur bagaimana Laravel memverifikasi izin akses user ke resource tertentu. |
| **`BroadcastServiceProvider.php`** | Mendaftarkan channel broadcast untuk real-time event. Saat ini tidak aktif karena aplikasi menggunakan polling untuk notifikasi. |
| **`EventServiceProvider.php`** | Mendaftarkan event-event dan listener-nya. Mengatur hubungan event (kejadian) dengan aksi yang harus dilakukan saat event terjadi. |
| **`RouteServiceProvider.php`** | Mengkonfigurasi bagaimana Laravel memuat file route. Mendaftarkan prefix `/api` untuk semua route di `routes/api.php`, mengatur rate limiting (60 request per menit per user/IP), dan memuat route `web.php`. |

#### 🗃️ Database (`database/`)

| File | Fungsi |
|------|--------|
| **`migrations/2024_01_01_000001_create_users_table.php`** | Membuat tabel `users` dengan kolom: `id` (UUID), `name`, `email` (unique), `password`, `role` (default: 'user'), `avatar`, dan timestamps. |
| **`migrations/2024_01_01_000002_create_categories_table.php`** | Membuat tabel `categories` dengan kolom: `id` (UUID), `name` (unique), `description`, dan timestamps. |
| **`migrations/2024_01_01_000003_create_threads_table.php`** | Membuat tabel `threads` dengan kolom: `id` (UUID), `title`, `content` (text), `user_id` (foreign key), `category_id` (foreign key), dan timestamps. |
| **`migrations/2024_01_01_000004_create_replies_table.php`** | Membuat tabel `replies` dengan kolom: `id` (UUID), `content` (text), `user_id` (FK), `thread_id` (FK), dan timestamps. |
| **`migrations/2024_01_01_000005_create_likes_table.php`** | Membuat tabel `likes` dengan kolom: `id` (UUID), `user_id` (FK), `thread_id` (FK), dan constraint unique pada kombinasi `user_id` + `thread_id` (agar satu user hanya bisa like satu kali per thread). |
| **`migrations/2024_01_01_000006_add_avatar_to_users_table.php`** | Menambahkan kolom `avatar` (nullable string) ke tabel `users` yang sudah ada. |
| **`migrations/2024_01_01_000007_add_parent_id_to_replies_table.php`** | Menambahkan kolom `parent_id` (nullable UUID, FK ke `replies.id`) ke tabel `replies` untuk mendukung balasan bersarang (threaded replies). |
| **`migrations/2024_01_01_000008_create_notifications_table.php`** | Membuat tabel `notifications` dengan kolom: `id` (UUID), `sender_id` (FK ke users), `receiver_id` (FK ke users), `thread_id` (FK), `reply_id` (FK), `type`, `is_read` (boolean), dan timestamps. |
| **`seeders/DatabaseSeeder.php`** | Seeder utama yang mengisi database dengan data contoh: 1 admin, 5 user, 6 kategori, 8 thread, 12 reply, dan likes random. Data ini memastikan semua anggota tim memiliki data awal yang sama setelah menjalankan `php artisan migrate --seed`. |
| **`factories/UserFactory.php`** | Factory bawaan Laravel untuk membuat data user palsu (fake) secara otomatis menggunakan library Faker. Berguna untuk testing dan seeding massal. |

#### 🛣️ Routes (`routes/`)

| File | Fungsi |
|------|--------|
| **`api.php`** | Mendefinisikan **semua endpoint API** aplikasi. Dibagi menjadi dua grup: **(1) Public Routes** — register, login, lihat kategori, lihat threads (tanpa login); **(2) Protected Routes** — logout, profil, CRUD threads/replies/categories, like, notifikasi (memerlukan token Sanctum via middleware `auth:sanctum`). |
| **`web.php`** | Route untuk halaman web tradisional (server-side rendered). Dalam project ini tidak digunakan secara aktif karena frontend menggunakan React SPA terpisah. |
| **`channels.php`** | Mendaftarkan broadcast channels untuk real-time events (WebSocket). Saat ini tidak digunakan karena notifikasi menggunakan sistem polling. |
| **`console.php`** | Mendaftarkan custom artisan commands. Bisa diisi dengan perintah CLI kustom untuk maintenance atau task scheduling. |

#### ⚙️ Config Files (`config/`)

| File | Fungsi |
|------|--------|
| **`app.php`** | Konfigurasi utama aplikasi: nama app, environment, debug mode, URL, timezone, locale, dan daftar service providers serta aliases. |
| **`auth.php`** | Konfigurasi authentication: guards (web, api), providers (eloquent/database), dan pengaturan password reset. |
| **`cors.php`** | Konfigurasi **Cross-Origin Resource Sharing**. Mengatur domain frontend mana yang diizinkan mengakses API. Saat ini diatur agar `http://localhost:5173` (Vite dev server) bisa melakukan request ke API dengan credentials (cookies/token). |
| **`database.php`** | Konfigurasi koneksi database. Mendukung SQLite, MySQL, PostgreSQL, dan SQL Server. Project ini menggunakan `pgsql` (PostgreSQL) sesuai pengaturan di `.env`. |
| **`filesystems.php`** | Konfigurasi disk penyimpanan file: `local` (private), `public` (bisa diakses via URL), dan `s3` (Amazon S3). Avatar user disimpan di disk `public`. |
| **`sanctum.php`** | Konfigurasi **Laravel Sanctum** untuk API token authentication. Mengatur stateful domains (domain yang menggunakan cookie-based auth), token expiration, dan middleware. Domain `localhost:5173` didaftarkan sebagai stateful domain. |
| **`broadcasting.php`** | Konfigurasi driver broadcast (pusher, ably, redis, log). |
| **`cache.php`** | Konfigurasi driver cache (file, database, redis, memcached). Default menggunakan `file`. |
| **`hashing.php`** | Konfigurasi algoritma hashing password (bcrypt/argon2). |
| **`logging.php`** | Konfigurasi channel logging (stack, single, daily, slack, dll). |
| **`mail.php`** | Konfigurasi driver email (SMTP, mailgun, SES, dll). |
| **`queue.php`** | Konfigurasi driver queue untuk background jobs (sync, database, redis, SQS). |
| **`services.php`** | Konfigurasi third-party services (Mailgun, Postmark, AWS). |
| **`session.php`** | Konfigurasi session driver dan lifetime. |
| **`view.php`** | Konfigurasi path penyimpanan view templates (Blade). |

#### 📦 File Konfigurasi Root Backend

| File | Fungsi |
|------|--------|
| **`artisan`** | CLI entry point untuk menjalankan perintah artisan (`php artisan migrate`, `php artisan serve`, dll). |
| **`composer.json`** | Mendaftarkan semua dependency PHP (Laravel, Sanctum, dll) beserta konfigurasi autoload PSR-4. |
| **`composer.lock`** | Lock file yang mencatat versi exact dari semua dependency yang terinstall, memastikan semua anggota tim menggunakan versi yang sama. |
| **`.env.example`** | Template konfigurasi environment. Rekan kerja meng-copy file ini menjadi `.env` lalu mengisi database credentials mereka sendiri. |
| **`.env`** | File konfigurasi environment aktif (berisi password database, app key, dll). **TIDAK di-upload ke GitHub** demi keamanan. |
| **`.gitignore`** | Daftar file/folder yang diabaikan Git di dalam folder backend (vendor, .env, storage logs, dll). |
| **`.gitattributes`** | Mengatur bagaimana Git menangani line endings dan diff untuk tipe file tertentu. |
| **`.editorconfig`** | Standarisasi konfigurasi editor (indentasi, charset, trailing whitespace) agar konsisten antar anggota tim. |
| **`phpunit.xml`** | Konfigurasi PHPUnit untuk menjalankan unit test dan feature test. |
| **`package.json`** | Dependency Node.js untuk backend (Vite, Laravel plugin). |
| **`vite.config.js`** | Konfigurasi Vite untuk asset bundling di sisi Laravel (digunakan jika memakai Blade + Vite). |

#### 🗂️ Folder Lainnya di Backend

| Folder | Fungsi |
|--------|--------|
| **`bootstrap/`** | Berisi file bootstrap aplikasi (`app.php`) yang menginisialisasi Laravel framework dan cache konfigurasi. |
| **`public/`** | Web root yang dapat diakses publik. Berisi `index.php` (entry point), `.htaccess`, dan symlink ke `storage/app/public` untuk file yang di-upload (avatar). |
| **`resources/`** | Berisi view templates Blade, file bahasa (localization), dan asset mentah (CSS/JS). Tidak banyak digunakan karena frontend terpisah. |
| **`storage/`** | Penyimpanan file: log aplikasi (`logs/`), file upload (`app/`), cache framework (`framework/`), dan session. |
| **`tests/`** | Berisi file unit test (`Unit/`) dan feature test (`Feature/`) menggunakan PHPUnit. |
| **`vendor/`** | Folder dependency PHP yang di-install oleh Composer. **TIDAK di-upload ke GitHub** — di-generate otomatis via `composer install`. |

---

### 2. Frontend (React)

#### 📦 File Konfigurasi Root Frontend

| File | Fungsi |
|------|--------|
| **`index.html`** | File HTML utama yang menjadi "shell" aplikasi React. Berisi elemen `<div id="root">` tempat React merender seluruh UI, link ke Google Fonts (Inter), dan meta tags SEO dasar. |
| **`package.json`** | Mendaftarkan semua dependency frontend: `react`, `react-dom`, `react-router-dom`, `axios`, `@vitejs/plugin-react`, dan script `dev`/`build`/`preview`. |
| **`package-lock.json`** | Lock file yang mencatat versi exact semua dependency npm, memastikan konsistensi antar mesin pengembang. |
| **`vite.config.js`** | Konfigurasi **Vite** (build tool). Mengatur: port dev server (`5173`), plugin React, dan **proxy API** — semua request ke `/api` otomatis diteruskan ke `http://localhost:8000` (Laravel backend) agar tidak terkena masalah CORS saat development. |

#### ⚙️ Entry Point (`src/`)

| File | Fungsi |
|------|--------|
| **`main.jsx`** | Titik awal eksekusi React. Menghubungkan komponen `<App />` ke elemen HTML `#root` menggunakan `ReactDOM.createRoot()` dan membungkusnya dengan `StrictMode` untuk deteksi masalah. |
| **`App.jsx`** | File sentral yang mengatur **Client-Side Routing** menggunakan React Router v6. Mendefinisikan semua path URL (`/`, `/login`, `/register`, `/threads/:id`, `/settings`, `/categories`, `/admin/categories`, `/create-thread`, `/notifications`) dan menghubungkannya ke komponen Page yang sesuai. Membungkus aplikasi dengan `AuthProvider` dan `ThemeProvider` agar data autentikasi dan tema bisa diakses di semua halaman. |
| **`index.css`** | Berisi **seluruh desain sistem** aplikasi (2000+ baris CSS). Menggunakan **CSS Custom Properties (Variables)** untuk mendukung Dark/Light Mode. Mencakup: color palette, tipografi, layout (Flexbox/Grid), komponen (card, button, form, navbar, badge, dll), animasi (fade-in, pulse, spin), efek glassmorphism, responsive design, dan seluruh styling halaman. |

#### 🔌 API Layer (`src/api/`)

| File | Fungsi |
|------|--------|
| **`axios.js`** | Konfigurasi sentral untuk semua komunikasi HTTP ke Laravel backend. Membuat instance Axios dengan `baseURL` ke `/api`. Memiliki dua **Interceptor** penting: **(1) Request Interceptor** — otomatis menyuntikkan token Sanctum dari `localStorage` ke header `Authorization: Bearer <token>` di setiap request; **(2) Response Interceptor** — otomatis mendeteksi response `401 Unauthorized`, menghapus token dari storage, dan redirect user ke halaman login. |

#### 🏠 Pages (`src/pages/`)

| File | Fungsi |
|------|--------|
| **`ThreadsPage.jsx`** | **Home page** aplikasi. Menampilkan daftar semua thread dengan fitur: pencarian real-time (search by title), filter per kategori (dropdown), pagination (load more), dan menampilkan info setiap thread (judul, penulis, kategori, jumlah reply, jumlah like, waktu dibuat). |
| **`ThreadDetailPage.jsx`** | Halaman **paling kompleks** di aplikasi. Menampilkan konten lengkap thread, tombol Like dengan animasi, daftar balasan bersarang (threaded replies) dengan indikator `↩ Membalas @NamaUser`, form reply dengan fitur @mention (auto-focus saat klik "Balas"), serta tombol edit/hapus untuk pemilik thread dan admin. |
| **`CreateThreadPage.jsx`** | Form untuk **membuat diskusi baru**. Berisi input judul, textarea konten, dropdown pilih kategori, dan tombol submit. Hanya bisa diakses oleh user yang sudah login (dilindungi `ProtectedRoute`). |
| **`CategoriesPage.jsx`** | Halaman yang menampilkan **semua kategori** dalam bentuk grid card. Setiap card menampilkan nama kategori, deskripsi, dan jumlah thread. Klik pada card akan navigate ke `ThreadsPage` dengan filter kategori tersebut via query parameter `?category_id=`. |
| **`AdminCategoriesPage.jsx`** | **Dashboard admin** untuk manajemen kategori (CRUD). Admin bisa menambah kategori baru, mengedit nama/deskripsi, dan menghapus kategori. Hanya admin yang bisa mengakses halaman ini. |
| **`LoginPage.jsx`** | Form **login** dengan input email dan password. Memanggil `login()` dari `AuthContext`, menampilkan error message jika gagal, dan redirect ke home page setelah berhasil login. |
| **`RegisterPage.jsx`** | Form **registrasi** dengan input nama, email, password, dan konfirmasi password. Memanggil `register()` dari `AuthContext` dengan validasi frontend. Redirect ke home setelah berhasil. |
| **`SettingsPage.jsx`** | Halaman **profil user** dengan 3 bagian: **(1)** Upload/hapus foto avatar (preview gambar sebelum upload), **(2)** Edit nama dan email, **(3)** Ganti password (password lama, password baru, konfirmasi). Semua perubahan langsung di-save ke backend via API. |
| **`NotificationsPage.jsx`** | Halaman **notifikasi**. Menampilkan daftar notifikasi dengan pesan dinamis (contoh: "Budi membalas thread Anda"), status baca/belum baca (visual berbeda), tombol tandai sudah dibaca, dan link langsung ke thread terkait. Ada tombol "Tandai semua sudah dibaca". |

#### 🧱 Components (`src/components/`)

| File | Fungsi |
|------|--------|
| **`Navbar.jsx`** | **Navigasi utama** di bagian atas. Menampilkan logo, link navigasi (Home, Kategori, Buat Thread), badge notifikasi yang **berdenyut (pulse animation)** jika ada notifikasi belum dibaca, toggle dark/light mode, dan menu user (Settings, Logout). Melakukan **polling ke API setiap 30 detik** untuk mengecek jumlah notifikasi baru (`/api/notifications/unread-count`). |
| **`ProtectedRoute.jsx`** | **Komponen pelindung route**. Membungkus halaman-halaman yang memerlukan login (Settings, Create Thread, Notifications, Admin). Jika user belum login, otomatis redirect ke halaman `/login`. Mengecek status autentikasi dari `AuthContext`. |

#### 🧠 Context (`src/context/`)

| File | Fungsi |
|------|--------|
| **`AuthContext.jsx`** | **Otak sistem autentikasi** di frontend. Menggunakan React Context API untuk menyediakan state `user` dan fungsi `login()`, `logout()`, `register()` secara global ke semua komponen. Saat halaman pertama kali dibuka, otomatis memanggil `/api/me` untuk mengecek apakah token yang tersimpan di `localStorage` masih valid. Jika valid, user otomatis ter-login kembali. |
| **`ThemeContext.jsx`** | **Pengelola tema** dark/light mode. Menyediakan state `theme` dan fungsi `toggleTheme()` secara global. Mengupdate atribut `data-theme` pada tag `<html>` untuk mengaktifkan CSS variables yang sesuai. Preferensi tema disimpan di `localStorage` agar tetap konsisten saat halaman di-refresh. |

#### 📂 Folder Lainnya di Frontend

| Folder | Fungsi |
|--------|--------|
| **`public/`** | Berisi file statis yang langsung disajikan tanpa processing oleh Vite (favicon, gambar statis, dll). |
| **`dist/`** | Folder output hasil build production (`npm run build`). Berisi file HTML, CSS, dan JS yang sudah di-minify dan di-optimize. **TIDAK di-upload ke GitHub**. |
| **`node_modules/`** | Folder dependency npm yang di-install. **TIDAK di-upload ke GitHub** — di-generate otomatis via `npm install`. |

---

## 📡 API Endpoint Reference

### Public Routes (Tanpa Login)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/register` | Registrasi akun baru |
| `POST` | `/api/login` | Login dan dapatkan token |
| `GET` | `/api/categories` | Lihat semua kategori |
| `GET` | `/api/categories/{id}` | Lihat detail kategori |
| `GET` | `/api/threads` | Lihat semua thread (+ search, filter, pagination) |
| `GET` | `/api/threads/{id}` | Lihat detail thread + replies |

### Protected Routes (Perlu Login + Token)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/logout` | Logout (hapus token) |
| `GET` | `/api/me` | Ambil data user yang sedang login |
| `PUT` | `/api/profile` | Update nama/email |
| `PUT` | `/api/profile/password` | Ganti password |
| `POST` | `/api/profile/avatar` | Upload foto avatar |
| `DELETE` | `/api/profile/avatar` | Hapus foto avatar |
| `POST` | `/api/categories` | Buat kategori *(admin only)* |
| `PUT` | `/api/categories/{id}` | Edit kategori *(admin only)* |
| `DELETE` | `/api/categories/{id}` | Hapus kategori *(admin only)* |
| `POST` | `/api/threads` | Buat thread baru |
| `PUT` | `/api/threads/{id}` | Edit thread *(pemilik only)* |
| `DELETE` | `/api/threads/{id}` | Hapus thread *(pemilik/admin)* |
| `POST` | `/api/threads/{id}/like` | Like/Unlike thread |
| `POST` | `/api/replies` | Buat reply baru |
| `PUT` | `/api/replies/{id}` | Edit reply *(pemilik only)* |
| `DELETE` | `/api/replies/{id}` | Hapus reply *(pemilik/admin)* |
| `GET` | `/api/notifications` | Lihat semua notifikasi |
| `GET` | `/api/notifications/unread-count` | Hitung notifikasi belum dibaca |
| `PUT` | `/api/notifications/{id}/read` | Tandai satu notifikasi dibaca |
| `PUT` | `/api/notifications/read-all` | Tandai semua notifikasi dibaca |

---

## 🚀 Instalasi & Setup

### Prasyarat
- **PHP** >= 8.1 dengan ekstensi `pdo_pgsql`
- **Composer** (PHP package manager)
- **Node.js** >= 18 dan **npm**
- **PostgreSQL** (database server)

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/forum-diskusi.git
cd forum-diskusi
```

### 2. Setup Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit file `.env` dan sesuaikan konfigurasi database PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=forum_komunitas
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Lalu jalankan:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 3. Setup Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

---

## 🔑 Akun Default

Setelah menjalankan `php artisan migrate --seed`, akun-akun berikut tersedia:

| Role | Nama | Email | Password |
|------|------|-------|----------|
| **Admin** | Admin Forum | `admin@forum.com` | `password123` |
| **User** | Budi Santoso | `budi@forum.com` | `password123` |
| **User** | Siti Rahayu | `siti@forum.com` | `password123` |
| **User** | Ahmad Fauzi | `ahmad@forum.com` | `password123` |
| **User** | Dewi Lestari | `dewi@forum.com` | `password123` |
| **User** | Rizky Pratama | `rizky@forum.com` | `password123` |

---

## 📝 Catatan Teknis (Arsitektur)

- **Sanctum Authentication**: Menggunakan token-based auth yang aman. Token disimpan di `localStorage` dan dikelola oleh interceptor Axios. Token otomatis dihapus jika expired (response 401).
- **UUID Primary Keys**: Semua tabel menggunakan UUID v4 sebagai primary key, memberikan keamanan ekstra karena ID tidak bisa ditebak (dibanding auto-increment integer).
- **Recursive Cascade Delete**: Fitur keamanan data yang memastikan jika sebuah thread/komentar dihapus, aplikasi membersihkan semua relasi bawahnya secara otomatis hingga ke tingkat notifikasi.
- **Vite Proxy**: Frontend dev server mem-proxy request `/api` ke Laravel backend (`localhost:8000`), menghindari masalah CORS saat development.
- **CORS Configuration**: Backend dikonfigurasi untuk menerima request dari `http://localhost:5173` dengan credentials, diatur via `config/cors.php` dan environment variable.
- **Dynamic Meta Content**: Seluruh konten dinamis, termasuk notifikasi, menggunakan relasi Eloquent agar data (seperti nama user) selalu mutakhir.
- **Premium UI**: Didesain dengan Inter font, transisi halus, animasi micro-interaction, glassmorphism effect, dan skema warna yang harmonis untuk memberikan kesan aplikasi modern dan professional.
- **Dark/Light Mode**: Didukung sepenuhnya melalui CSS Custom Properties yang berganti berdasarkan atribut `data-theme` pada elemen HTML, dengan preferensi tersimpan di `localStorage`.

---

**Dibuat untuk mata kuliah Full Stack Development — Semester 4**
