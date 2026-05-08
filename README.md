# 🗣️ Forum Komunitas

Aplikasi **Forum Diskusi** berbasis web full-stack yang dibangun menggunakan **Laravel 10** (Backend REST API) dan **React + Vite** (Frontend SPA). Forum ini memiliki fitur lengkap mulai dari autentikasi OTP, CRUD threads, upload gambar, pengajuan kategori, threaded replies dengan @mention, sistem like, notifikasi real-time, dark/light mode, hingga manajemen profil.

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

### 🔐 Autentikasi & Keamanan
- **Register dengan OTP** — Registrasi akun baru dengan validasi email menggunakan kode OTP.
- **Login** — Login dengan email dan password, menghasilkan token API (Laravel Sanctum).
- **Reset Password** — Lupa password dapat di-reset melalui link/OTP yang dikirimkan via email (dengan masa berlaku).
- **Logout** — Menghapus token aktif sehingga sesi berakhir.
- **Role-Based Access** — Dua role: `admin` dan `user`. Admin memiliki akses kelola kategori dan hapus konten milik siapapun.
- **Protected Routes** — Halaman tertentu hanya dapat diakses setelah login (frontend & backend).

### 💬 Threads (Diskusi)
- **Buat Thread** — Membuat diskusi baru dengan judul, konten, dan kategori.
- **Image Upload** — Mendukung upload gambar berbarengan dengan pembuatan thread dan juga background processing.
- **Lihat Daftar Thread** — Halaman utama menampilkan semua threads dengan pagination.
- **Detail Thread** — Melihat konten lengkap thread beserta semua balasan.
- **Edit & Hapus Thread** — Pemilik thread dapat mengedit konten, menghapus thread akan melakukan cascade delete.

### 💬 Replies (Balasan) dengan Threaded @Mention
- **Balas Thread & Upload Gambar** — Menulis balasan langsung ke thread, mendukung lampiran gambar.
- **Balas Reply (Threaded)** — Membalas komentar spesifik seseorang dengan indikator `↩ Membalas @NamaUser`.
- **@Mention** — Saat klik tombol "Balas", otomatis muncul badge `Membalas @NamaUser`.
- **Edit & Hapus Reply** — Hapus reply akan menghapus semua child replies dan notifikasinya.

### 🗂️ Pengajuan Kategori (Category Requests)
- **Ajukan Kategori** — User bisa mengajukan kategori baru ke Admin.
- **Approval Admin** — Admin bisa menyetujui (approve) atau menolak (reject) pengajuan kategori dari Dashboard Admin.

### ❤️ Like System & Notifikasi
- **Toggle Like** — User bisa like/unlike thread.
- **Notifikasi Otomatis** — Muncul saat ada balasan di thread kamu, seseorang membalas komentar kamu, atau status pengajuan kategori diupdate.
- **Badge Unread** — Navbar menampilkan jumlah notifikasi belum dibaca.

### 🌗 Dark/Light Mode & Profil User
- **Toggle Theme** — Switch antara mode gelap dan terang, disimpan di `localStorage`.
- **Edit Profil & Upload Avatar** — Ubah nama, email, dan foto profil.

---

## 🛠 Tech Stack

### ⚙️ Backend
| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Laravel 10 (PHP 8.1+) |
| **Database** | PostgreSQL |
| **Authentication** | Laravel Sanctum (Token-based API) |
| **Email Service** | SMTP (via view Blade untuk template email) |

### 💻 Frontend
| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 18 + Vite |
| **Styling** | Vanilla CSS dengan CSS Custom Properties |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |

---

## 📂 Struktur Folder Project

```
Forum Diskusi/
├── README.md                          # Dokumentasi project
├── backend/                           # Laravel 10 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── PasswordResetController.php
│   │   │   │       ├── ThreadController.php
│   │   │   │       ├── ReplyController.php
│   │   │   │       ├── CategoryController.php
│   │   │   │       ├── CategoryRequestController.php
│   │   │   │       └── NotificationController.php
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Thread.php
│   │   │   ├── ThreadImage.php
│   │   │   ├── Reply.php
│   │   │   ├── ReplyImage.php
│   │   │   ├── Like.php
│   │   │   ├── Category.php
│   │   │   ├── CategoryRequest.php
│   │   │   └── Notification.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── resources/
│   │   └── views/
│   │       └── emails/
│   │           ├── otp-verification.blade.php
│   │           └── reset-password.blade.php
│   └── routes/
│       └── api.php
│
└── frontend/                          # React 18 + Vite SPA
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── Alert.jsx
        │   ├── ConfirmDialog.jsx
        │   ├── Footer.jsx
        │   ├── Navbar.jsx
        │   ├── OtpInput.jsx
        │   ├── PasswordInput.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── ThreadsPage.jsx
            ├── ThreadDetailPage.jsx
            ├── CreateThreadPage.jsx
            ├── CategoriesPage.jsx
            ├── AdminCategoriesPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── ForgotPasswordPage.jsx
            ├── ResetPasswordPage.jsx
            ├── SettingsPage.jsx
            ├── NotificationsPage.jsx
            └── NotFoundPage.jsx
```

---

## 📁 Detail File & Fungsinya (Deep Dive)

### 1. Backend (Laravel)

#### 🎮 Controllers (`app/Http/Controllers/Api/`)

| File | Fungsi |
|------|--------|
| **`AuthController.php`** | Logika autentikasi, registrasi (dengan trigger OTP), profil, dan upload avatar. |
| **`PasswordResetController.php`** | Mengelola proses permintaan reset password dan verifikasi token/OTP untuk mengubah password. |
| **`ThreadController.php`** | CRUD Thread, termasuk penanganan upload `ThreadImage` dan optimasi penyimpanan secara background. |
| **`ReplyController.php`** | CRUD Reply, fitur upload `ReplyImage`, notifikasi balasan (termasuk threaded @mention). |
| **`CategoryController.php`** | Manajemen kategori diskusi untuk ditampilkan kepada user dan CRUD oleh admin. |
| **`CategoryRequestController.php`** | Pengajuan kategori baru oleh user dan approval/rejection oleh admin. |
| **`NotificationController.php`** | Mengambil notifikasi user, menghitung *unread count*, dan mark as read. |

#### 🗄️ Models (`app/Models/`)

| File | Fungsi |
|------|--------|
| **`User.php`** | Data user dengan fitur UUID dan Sanctum tokens. |
| **`Thread.php` & `ThreadImage.php`** | Representasi diskusi dan relasinya ke banyak gambar. Cascade hapus gambar jika thread dihapus. |
| **`Reply.php` & `ReplyImage.php`** | Balasan thread (dengan parent_id untuk nesting) dan lampiran gambar balasan. |
| **`Category.php` & `CategoryRequest.php`** | Pengelompokan diskusi dan tabel sementara untuk menampung pengajuan kategori sebelum disetujui. |
| **`Notification.php`** | Tabel notifikasi dengan tipe (reply, mention, category_approved). |

#### 📧 Template Email (`resources/views/emails/`)

| File | Fungsi |
|------|--------|
| **`otp-verification.blade.php`** | Template HTML untuk pengiriman kode OTP pendaftaran (di-localize ke bahasa Indonesia). |
| **`reset-password.blade.php`** | Template HTML untuk link dan kode reset password. |

---

### 2. Frontend (React)

#### 🏠 Pages (`src/pages/`)

| File | Fungsi |
|------|--------|
| **`LandingPage.jsx`** | Halaman depan perkenalan aplikasi sebelum masuk ke forum utama. |
| **`ThreadsPage.jsx`** | Menampilkan daftar semua thread, integrasi search dan filter kategori. |
| **`ThreadDetailPage.jsx`** | Menampilkan thread lengkap, daftar balasan, dan form reply (mendukung upload gambar). |
| **`CreateThreadPage.jsx`** | Form membuat thread baru dengan lampiran gambar (optimistic upload UI). |
| **`CategoriesPage.jsx`** | Menampilkan daftar kategori. Termasuk fitur modal/form untuk **mengajukan kategori baru**. |
| **`AdminCategoriesPage.jsx`** | Dashboard admin mengelola kategori dan mereview **Category Requests**. |
| **`LoginPage.jsx` & `RegisterPage.jsx`** | Form autentikasi. Register terhubung ke verifikasi OTP sebelum akun aktif. |
| **`ForgotPasswordPage.jsx` & `ResetPasswordPage.jsx`** | Flow lupa password (meminta OTP ke email, lalu input password baru). |
| **`SettingsPage.jsx`** | Pengaturan profil dan ganti password. |
| **`NotificationsPage.jsx`** | List notifikasi aktivitas user. |
| **`NotFoundPage.jsx`** | Halaman 404 dinamis lengkap dengan redirect countdown otomatis ke Home. |

#### 🧱 Components (`src/components/`)

| File | Fungsi |
|------|--------|
| **`Alert.jsx` & `ConfirmDialog.jsx`** | Komponen UI re-usable (menggunakan React Portals untuk z-index tinggi) untuk konfirmasi hapus atau notifikasi sukses/error. |
| **`OtpInput.jsx`** | Komponen input OTP dengan auto-focus antar kotak digit dan visual divider. |
| **`PasswordInput.jsx`** | Komponen input khusus password dengan fitur toggle lihat/sembunyikan (eye icon). |
| **`Navbar.jsx`** | Navigasi dengan dropdown menu admin, badge notifikasi, dan toggle tema. |

#### 🧠 Context (`src/context/`)

| File | Fungsi |
|------|--------|
| **`AuthContext.jsx`** | Mengelola state login user. Di-update untuk mencegah persistensi sesi berlebih saat tidak diinginkan. |
| **`ThemeContext.jsx`** | Mengelola tema dark/light mode. |

---

## 📡 API Endpoint Reference

Selain endpoint standar (CRUD), aplikasi memiliki endpoint baru:

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/register/verify-otp` | Verifikasi OTP saat daftar |
| `POST` | `/api/forgot-password` | Minta link/OTP reset password |
| `POST` | `/api/reset-password` | Eksekusi ganti password dari form lupa password |
| `POST` | `/api/category-requests` | User ajukan kategori baru |
| `PUT` | `/api/category-requests/{id}/approve` | Admin setujui pengajuan |

---

## 🚀 Instalasi & Setup

### Prasyarat
- **PHP** >= 8.1 dengan ekstensi `pdo_pgsql`
- **Composer** (PHP package manager)
- **Node.js** >= 18 dan **npm**
- **PostgreSQL** (database server)
- **SMTP Server** (contoh: Mailtrap/Google SMTP untuk pengiriman email)

### 1. Clone Repository & Setup Backend

```bash
git clone <url-repo>
cd forum-diskusi/backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit file `.env` dan sesuaikan database PostgreSQL dan **konfigurasi Mail**:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=forum_komunitas
DB_USERNAME=postgres
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS="noreply@forum.com"
```

Jalankan migrasi dan server:
```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 2. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

---

## 📝 Catatan Teknis (Arsitektur)

- **Optimistic Uploads**: Form yang membutuhkan upload gambar didesain dengan konsep optimistic—mengirim data teks secara instan dan memproses image upload di background, dengan indikator upload yang berjalan di seluruh halaman (global upload state).
- **Z-Index Management dengan Portals**: Komponen overlay seperti Alert dan Dialog menggunakan *React Portals* untuk menjamin komponen berada di top-level DOM demi mencegah isu *z-index stacking context*.
- **Email Notification Localization**: Email sistem (Reset Password, OTP) sepenuhnya di-localize ke Bahasa Indonesia demi kejelasan pengguna.
- **Session Timeout & Security**: Reset link memiliki limit kadaluarsa (10 menit) untuk keamanan. Sesi tab/browser ditangani agar persistensi token bekerja sesuai kebijakan privasi forum.

---

**Dibuat untuk mata kuliah Full Stack Development — Semester 4**
