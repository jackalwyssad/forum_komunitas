# Forum Komunitas - Dokumentasi Lengkap & Rinci

Proyek "Forum Komunitas" adalah aplikasi forum diskusi berbasis web yang dibangun dengan arsitektur modern menggunakan Laravel (Backend) dan React/Next.js (Frontend). Dokumentasi ini mencakup penjelasan fungsional setiap file, alur request, diagram arsitektur, endpoint API, dan panduan setup lokal maupun produksi.

---

## 1. Struktur Folder & Tanggung Jawab File

### == BACKEND (Laravel) ==

#### `app/Console/`
*   `Kernel.php`: Mendaftarkan command Artisan khusus dan mendefinisikan jadwal tugas (task scheduling) seperti pembersihan token kedaluwarsa atau pengiriman email batch.

#### `app/Exceptions/`
*   `Handler.php`: Menangani semua exception dan error yang terjadi di aplikasi. Mengonversi error model not found, validasi, dan autentikasi menjadi respons JSON yang sesuai dengan standar API.

#### `app/Http/Controllers/Api/`
*   `AuthController.php` → Menangani proses autentikasi termasuk `sendOtp`, `verifyOtp`, `login`, `logout`, `me`, `updateProfile`, `changePassword`, `uploadAvatar`, dan `removeAvatar`. Memanggil model `User` dan mengirimkan email menggunakan view `otp-verification`.
*   `CategoryController.php` → Mengelola kategori forum (CRUD). `index` dan `show` bersifat publik, sementara `store`, `update`, `destroy` hanya dapat diakses oleh admin. Memanggil model `Category`.
*   `CategoryRequestController.php` → Menangani pengajuan kategori baru oleh user dan persetujuan/penolakan oleh admin. Berinteraksi dengan `CategoryRequest` dan mengirim `Notification` ke user atau admin terkait.
*   `NotificationController.php` → Menangani pengambilan notifikasi, menghitung notifikasi belum terbaca, dan menandai notifikasi telah dibaca. Memanggil model `Notification`.
*   `PasswordResetController.php` → Mengatur alur lupa password dari `sendResetLink`, `checkToken`, hingga `resetPassword`. Menggunakan `password_reset_tokens` table dan mengirim email menggunakan view `reset-password`.
*   `ReplyController.php` → Mengatur balasan thread (`store`, `update`, `destroy`). Mendukung upload gambar (model `ReplyImage`) dan membalas secara hierarki (`parent_id`). Mengirim notifikasi menggunakan model `Notification` ke pemilik thread atau balasan induk.
*   `ThreadController.php` → Mengelola diskusi utama (CRUD). Mendukung upload multiple images (`ThreadImage`), toggle status (`open`, `solved`, `closed`), dan sistem like (model `Like`). Memanggil fungsi pencarian dan filter kategori.
*   `Controller.php` → Base controller standar Laravel yang di-extend oleh semua controller di atas.

#### `app/Http/Middleware/`
*   `Authenticate.php`: Middleware bawaan untuk memastikan pengguna sudah login (biasanya melalui Sanctum untuk API).
*   `EncryptCookies.php`, `PreventRequestsDuringMaintenance.php`, `TrimStrings.php`, `TrustHosts.php`, `TrustProxies.php`, `ValidateSignature.php`, `VerifyCsrfToken.php`: Middleware standar keamanan dan pemrosesan request Laravel.

#### `app/Http/Requests/`
Berisi kelas validasi Form Request untuk memisahkan logika validasi dari controller:
*   `ChangePasswordRequest.php`: Validasi ubah password.
*   `LoginRequest.php`: Validasi login email dan password.
*   `RegisterRequest.php`: Validasi pendaftaran (nama, email, konfirmasi password).
*   `StoreCategoryRequest.php` & `UpdateCategoryRequest.php`: Validasi input kategori.
*   `StoreReplyRequest.php`: Validasi konten balasan dan lampiran foto (maks 5 gambar @3MB).
*   `StoreThreadRequest.php` & `UpdateThreadRequest.php`: Validasi judul, konten, dan foto thread (maks 5 gambar @500KB).
*   `UpdateProfileRequest.php`: Validasi pembaruan nama profil.

#### `app/Http/Resources/`
Berisi transformasi data model menjadi respons JSON yang terstruktur (API Resources):
*   `CategoryResource.php`: Format data kategori, menyertakan total thread jika di-load.
*   `NotificationResource.php`: Format data notifikasi, menyertakan data pengirim dan relasi thread/reply.
*   `ReplyResource.php`: Format data balasan, menyertakan nested user, gambar, dan children replies.
*   `ThreadResource.php`: Format data thread, menyertakan jumlah likes, jumlah replies, gambar, dan status.
*   `UserResource.php`: Format profil pengguna.

#### `app/Models/`
Berisi representasi tabel di database (Eloquent ORM) dengan trait `HasUuids` (menggunakan UUID sebagai primary key):
*   `Category.php`: Kategori forum. Memiliki relasi `hasMany` ke `Thread`.
*   `CategoryRequest.php`: Pengajuan kategori oleh pengguna. Relasi ke `User`.
*   `Like.php`: Pivot tabel penyuka thread. Relasi ke `User` dan `Thread`.
*   `Notification.php`: Sistem notifikasi. Relasi ke `User` (penerima), `User` (pengirim), `Thread`, dan `Reply`.
*   `Reply.php`: Balasan diskusi. Memiliki relasi `belongsTo` ke `Thread` dan `User`, serta `hasMany` ke `Reply` (untuk hierarki balasan/nested replies). Boot method menangani cascade delete.
*   `ReplyImage.php`: Lampiran gambar pada balasan.
*   `Thread.php`: Topik diskusi utama. Relasi ke `User`, `Category`, `Reply`, `Like`, dan `ThreadImage`. Boot method cascade delete.
*   `ThreadImage.php`: Lampiran gambar pada thread.
*   `User.php`: Data pengguna. Implementasi `Authenticatable`, trait `HasApiTokens` dari Sanctum. Relasi ke `Thread`, `Reply`, `Like`.

#### `database/migrations/`
File migrasi untuk skema database (dijalankan berurutan):
*   `...create_users_table.php`, `...create_categories_table.php`, `...create_threads_table.php`, `...create_replies_table.php`, `...create_likes_table.php`, `...add_avatar_to_users_table.php`, `...add_parent_id_to_replies_table.php`, `...create_notifications_table.php`, `...add_is_public_to_categories_table.php`, `...create_email_otps_table.php`, `...create_thread_images_table.php`, `...create_reply_images_table.php`, `...add_status_to_threads_table.php`, `...create_category_requests_table.php`.

#### `resources/views/emails/`
*   `otp-verification.blade.php`: Template email HTML untuk pengiriman kode OTP pendaftaran. Dipanggil dari `AuthController@sendOtp`.
*   `reset-password.blade.php`: Template email HTML untuk link reset password. Dipanggil dari `PasswordResetController@sendResetLink`.

#### `routes/`
*   `api.php`: Mendaftarkan semua endpoint API backend. Dibagi menjadi rute publik (login, register, GET threads, GET categories) dan rute protected dengan middleware `auth:sanctum`. Terdapat route webhook `/deploy/run-migrations` untuk CI/CD.
*   `web.php`: Rute dasar web (biasanya mengembalikan tampilan welcome/dokumentasi API).

#### Konfigurasi & Root
*   `config/`: Mengatur database, CORS, Sanctum, mailer, dll.
*   `.env`: File environment variable (kredensial DB, SMTP, URL frontend).
*   `composer.json`: Dependensi backend (Laravel, Sanctum, Guzzle, dll).
*   `artisan`: CLI Laravel.

---

### == FRONTEND (React / Vite) ==

#### `src/api/`
*   `axios.js`: Konfigurasi *instance* Axios. Mengatur base URL (lokal vs produksi), menyisipkan JWT token Sanctum dari `localStorage` via interceptor, dan menangani logout otomatis jika server mengembalikan HTTP 401 Unauthorized. Dipanggil oleh semua komponen yang membutuhkan data dari server.

#### `src/components/`
*   `Alert.jsx`: Komponen notifikasi pop-up (success/error/warning).
*   `ConfirmDialog.jsx`: Modal konfirmasi aksi destruktif (hapus thread/reply, hapus avatar).
*   `Footer.jsx`: Footer global aplikasi.
*   `Navbar.jsx`: Navigasi utama. Menampilkan logo, menu dinamis berdasarkan role, toggle dark mode, notifikasi badge (polling), dan dropdown profil pengguna. Memanggil `useAuth` dan `useTheme`.
*   `OtpInput.jsx`: Komponen input 6 digit OTP.
*   `PasswordInput.jsx`: Input password dengan fitur toggle lihat sandi.
*   `ProtectedRoute.jsx`: Komponen pembungkus (wrapper) untuk membatasi akses halaman hanya untuk pengguna yang sudah login (dan khusus admin jika `adminOnly` true).

#### `src/context/`
*   `AuthContext.jsx`: State management global untuk autentikasi. Menyimpan `user`, token, mengatur session idle timeout (20 menit), fungsi `login`, `logout`, `sendOtp`, `verifyOtp`.
*   `ThemeContext.jsx`: Mengelola state dark/light mode yang disimpan di `localStorage` dan di-apply ke `document.documentElement`.

#### `src/pages/`
*   `AdminCategoriesPage.jsx`: Halaman khusus admin untuk menambah, mengedit, menghapus kategori, serta menyetujui/menolak usulan kategori dari user.
*   `CategoriesPage.jsx`: Halaman untuk melihat semua kategori yang ada. User dapat mengusulkan kategori baru dari sini.
*   `CreateThreadPage.jsx`: Halaman membuat thread diskusi. Terdapat fitur validasi panjang karakter, upload multiple foto, dan kompresi gambar sisi klien menggunakan Canvas (WebP) sebelum dikirim ke backend via `api.post`.
*   `ForgotPasswordPage.jsx`: Form untuk memasukkan email guna mengirim link reset password.
*   `LandingPage.jsx`: Halaman beranda utama menyambut pengunjung.
*   `LoginPage.jsx`: Halaman masuk pengguna.
*   `NotFoundPage.jsx`: Tampilan untuk URL yang tidak terdaftar (404).
*   `NotificationsPage.jsx`: Halaman daftar notifikasi dengan kemampuan menandai sudah dibaca semua.
*   `RegisterPage.jsx`: Halaman pendaftaran dua langkah: isi form -> kirim OTP -> verifikasi OTP -> sukses.
*   `ResetPasswordPage.jsx`: Halaman yang diakses dari link email untuk memasukkan password baru.
*   `SettingsPage.jsx`: Pengaturan profil, upload/hapus foto profil, dan ganti password.
*   `ThreadDetailPage.jsx`: Halaman interaktif detail thread. Menampilkan hierarki balasan, fitur balas bersarang (reply-to), upload lampiran balasan, aksi like, ubah status thread (solved, closed), edit/delete milik sendiri, dan image lightbox gallery.
*   `ThreadsPage.jsx`: Halaman daftar seluruh diskusi, dilengkapi fitur pencarian, filter kategori, dan paginasi.

#### File Konfigurasi
*   `App.jsx`: Entry point React Router (`BrowserRouter`). Menghubungkan seluruh Context dan menentukan routing halamannya (publik & terproteksi).
*   `index.css`: File styling utama menggunakan CSS Vanilla. Menyimpan CSS Variables (Tokens) untuk tema terang dan gelap.
*   `main.jsx`: Root render React.
*   `vite.config.js`: Konfigurasi bundler Vite.
*   `package.json`: Daftar pustaka frontend (`react`, `react-router-dom`, `axios`).

---

## 2. Panduan Kustomisasi (Jika Mau Ubah Sesuatu, Di Sini Tempatnya!)

Jika di masa depan Anda perlu memodifikasi limit, batasan waktu, atau konfigurasi khusus, ini adalah file yang harus Anda buka:

### Backend (Laravel)
- **Mengubah batas ukuran foto Thread/Balasan**
  - Thread: `app/Http/Controllers/Api/ThreadController.php` pada rule `'images.*' => 'max:512'` (512 KB)
  - Reply: `app/Http/Controllers/Api/ReplyController.php` pada rule `'images.*' => 'max:3072'` (3 MB)
  - Avatar: `app/Http/Controllers/Api/AuthController.php` pada `uploadAvatar()` rule `max:2048` (2 MB)

- **Mengubah masa aktif kode OTP (Default: 10 Menit)**
  - Buka `app/Http/Controllers/Api/AuthController.php`
  - Cari `Carbon::now()->addMinutes(10)` di fungsi `sendOtp()` dan sesuaikan angkanya.

- **Mengubah masa aktif link Reset Password (Default: 10 Menit)**
  - Buka `app/Http/Controllers/Api/PasswordResetController.php`
  - Ubah angka pada `addMinutes(10)` di fungsi `checkToken()` dan `resetPassword()`.

- **Mengubah template/isi Email**
  - Buka `resources/views/emails/otp-verification.blade.php` untuk OTP
  - Buka `resources/views/emails/reset-password.blade.php` untuk Link Reset.

### Frontend (React/Vite)
- **Mengubah Timeout Session Idle (Otomatis Logout)**
  - Buka `frontend/src/context/AuthContext.jsx`
  - Cari `const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 menit`
  - Ubah angkanya sesuai kebutuhan (dalam satuan milidetik).

- **Mengubah Kualitas Kompresi & Batas Ukuran Upload WebP (Thread)**
  - Buka `frontend/src/pages/CreateThreadPage.jsx`
  - Kualitas gambar: Cari `'image/webp', 0.45` pada `canvas.toBlob(...)` (Ubah 0.45 jadi lebih besar jika foto kurang jernih).
  - Resolusi maksimum: Cari `const MAX_W = 800;` (Ubah jika ingin resolusi lebih tinggi).

- **Mengubah Warna Utama/Tema Dasar**
  - Buka `frontend/src/index.css`
  - Modifikasi variabel seperti `--primary: #6366f1;` di selector `:root` (untuk mode terang) dan `[data-theme="dark"]` (untuk mode gelap).

- **Mengubah API Base URL**
  - Buka `frontend/src/api/axios.js`
  - Ubah variabel `BASE_URL` dan `STORAGE_URL`.

---

## 3. Alur Request (Naratif)

### Skenario 1: Registrasi Pengguna Baru (Dengan OTP)
1.  **Frontend (`RegisterPage.jsx`)**: Pengguna mengisi Form Registrasi (Nama, Email, Password). Menekan submit.
2.  **Frontend (`AuthContext.jsx`)**: Fungsi `sendOtp` dipanggil, menjalankan Axios POST ke `/api/register/send-otp`.
3.  **Backend (`api.php`)**: Rute menerima request dan meneruskan ke `AuthController@sendOtp`.
4.  **Backend (`AuthController.php`)**: Melakukan validasi input. Menghapus OTP lama jika ada, me-generate OTP 6 digit. Menyimpan OTP, Nama, Email, Password (plain) ke tabel `email_otps`.
5.  **Backend (Mail)**: Memicu pengiriman email via SMTP memuat template `otp-verification.blade.php`. Mengembalikan respons HTTP 200.
6.  **Frontend (`RegisterPage.jsx`)**: Beralih ke langkah kedua (Form OTP). Pengguna mengecek email, memasukkan 6 angka.
7.  **Frontend (`AuthContext.jsx`)**: Menjalankan Axios POST ke `/api/register/verify-otp`.
8.  **Backend (`AuthController.php`)**: Memeriksa keberadaan email di `email_otps` dan mencocokkan kodenya. Jika cocok dan tidak expired, data dipindahkan menjadi record baru di tabel `users`.
9.  **Backend (Sanctum)**: Memanggil `$user->createToken(...)` untuk membuat token akses JWT. Mengembalikan JSON berisi `user` dan `token` (HTTP 201).
10. **Frontend (`AuthContext.jsx`)**: Menyimpan `token` dan `user` ke `localStorage`. Mengubah state global `user`.
11. **Frontend (`RegisterPage.jsx`)**: Aplikasi diarahkan ke halaman utama (login otomatis).

### Skenario 2: Membuat Thread dengan Upload Gambar
1.  **Frontend (`CreateThreadPage.jsx`)**: User mengisi Judul, memilih Kategori, konten, dan melampirkan 3 gambar.
2.  **Frontend (Image Compression)**: Klien mengompres 3 gambar tersebut via HTML Canvas (`compressImage()`) menjadi format WebP dengan kualitas 45% untuk menghemat bandwidth.
3.  **Frontend (Axios)**: POST request pertama dikirim ke `/api/threads` hanya dengan data teks (judul, konten, category_id) untuk kecepatan interaksi.
4.  **Backend (`ThreadController@store`)**: Menyimpan data thread ke database tabel `threads`. Merespons dengan objek Thread (ID didapat).
5.  **Frontend (`CreateThreadPage.jsx`)**: UI langsung melakukan navigasi ke `/threads/{id}`. Sesi `uploading_photos_{id}` di-set aktif.
6.  **Frontend (Background Process)**: Klien segera melakukan request Axios kedua (PUT) ke `/api/threads/{id}` dengan payload `FormData` (array file gambar). Tidak memblokir navigasi.
7.  **Backend (`ThreadController@update`)**: Menerima file, memindahkannya ke storage folder `threads` via `Storage::disk('public')`, mencatatnya di tabel `thread_images`. Merespons HTTP 200.
8.  **Frontend (`ThreadDetailPage.jsx`)**: Pada saat halaman dimuat, polling per 3 detik mengecek apakah gambar telah selesai di-upload (dengan melihat isi array images pada balasan GET `/threads/{id}`). Begitu ada isinya, banner loading upload dihapus, dan gallery ditampilkan.

### Skenario 3: Membalas Komentar (Nested Reply) dan Notifikasi
1.  **Frontend (`ThreadDetailPage.jsx`)**: User menekan tombol "↩️ Balas" pada suatu komentar milik User B. Form memunculkan indikator "Membalas @UserB".
2.  **Frontend (Axios)**: Form submit dieksekusi, mengirim POST `/api/replies` dengan `thread_id` dan `parent_id` (ID komentar User B).
3.  **Backend (`ReplyController@store`)**: Validasi request. Baris direkam pada tabel `replies`. Jika ada file gambar, diproses ke tabel `reply_images`.
4.  **Backend (`ReplyController@store` Notifikasi)**: 
    - Mengecek pemilik Thread (User A). Jika yang membalas bukan User A, tabel `notifications` dibuatkan baris (Pesan: "membalas thread...").
    - Mengecek pemilik balasan induk (User B). Jika yang membalas bukan User B, tabel `notifications` dibuatkan baris tambahan (Pesan: "membalas komentar Anda di...").
5.  **Backend**: Mengembalikan objek `reply` terbaru lengkap dengan relasi (HTTP 201).
6.  **Frontend (`ThreadDetailPage.jsx`)**: Menerima respons dan mem-push objek reply ke state lokal tanpa me-refresh seluruh halaman (Optimistic UI Update).
7.  **Frontend (`Navbar.jsx` untuk User B)**: Saat User B sedang membuka aplikasi, interval polling 30 detiknya ke `/api/notifications/unread-count` akan menangkap perubahan badge notifikasi.

---

## 4. Diagram Hubungan Antar File

Berikut adalah ilustrasi ketergantungan (dependencies) secara garis besar:

```text
=================[ FRONTEND ARCHITECTURE ]=================

              [ App.jsx (Router) ]
                       |
     +-----------------+-----------------+
     |                                   |
[ Context Providers ]             [ UI Components ]
  - AuthContext                     - Navbar
  - ThemeContext                    - ProtectedRoute
         |                               |
         |                               V
         |                      [ Pages (Views) ]
         |                        - LoginPage
         |                        - CreateThreadPage
         |                        - ThreadDetailPage
         +------------> [ api/axios.js ] <---------------+
                              | (HTTP Requests)
                              V
=================[ BACKEND ARCHITECTURE ]==================

                         [ routes/api.php ]
                               |
                   +-----------+-----------+
                   | (Middleware: sanctum) |
                   V                       V
       [ AuthController ]           [ ThreadController ]
       [ ReplyController]           [ CategoryController ]
                   |                       |
      +------------+-----------------------+----------+
      |            |                       |          |
      V            V                       V          V
  [ User ]     [ Thread ]              [ Reply ]  [ Category ]
(HasApiTokens) (HasMany Replies)  (BelongsTo Thread)  (HasMany)
      |            |                       |
      |            +---[ ThreadImage ]     +---[ ReplyImage ]
      |            |
      +----[ Notification ] (Terkait dengan aksi Like, Reply, Kategori)
      |
  [ DB/Storage ] (PostgreSQL/MySQL & Local Disk 'public')
```

---

## 5. Tabel API Endpoints Utama

| Method | Path | Middleware | Controller@method | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/register/send-otp` | - | `AuthController@sendOtp` | Kirim kode OTP validasi registrasi ke Email |
| **POST** | `/api/register/verify-otp` | - | `AuthController@verifyOtp` | Validasi OTP, buat User, return Sanctum Token |
| **POST** | `/api/login` | - | `AuthController@login` | Verifikasi email & password, return Token |
| **POST** | `/api/forgot-password` | - | `PasswordResetController@sendResetLink` | Kirim link reset password ke Email (berlaku 10m) |
| **POST** | `/api/reset-password` | - | `PasswordResetController@resetPassword` | Ubah password berdasarkan token valid |
| **GET** | `/api/categories` | - | `CategoryController@index` | List semua kategori |
| **GET** | `/api/threads` | - | `ThreadController@index` | List thread dengan filter dan paginasi |
| **GET** | `/api/threads/{id}` | - | `ThreadController@show` | Detail thread beserta list hierarki balasan |
| **GET** | `/api/me` | `auth:sanctum` | `AuthController@me` | Ambil data profil user yang sedang login |
| **POST** | `/api/logout` | `auth:sanctum` | `AuthController@logout` | Hapus (revoke) token aktif |
| **POST** | `/api/profile/avatar` | `auth:sanctum` | `AuthController@uploadAvatar` | Update foto profil pengguna |
| **POST** | `/api/threads` | `auth:sanctum` | `ThreadController@store` | Membuat thread baru (Multiple image support) |
| **PUT** | `/api/threads/{id}` | `auth:sanctum` | `ThreadController@update` | Update konten thread, hapus/tambah foto (Via POST `_method=PUT`) |
| **PUT** | `/api/threads/{id}/status` | `auth:sanctum` | `ThreadController@updateStatus` | Ubah status (open, solved, closed) |
| **POST** | `/api/replies` | `auth:sanctum` | `ReplyController@store` | Membuat balasan thread/komentar |
| **POST** | `/api/threads/{id}/like` | `auth:sanctum` | `ThreadController@toggleLike` | Toggle like/unlike sebuah diskusi |
| **GET** | `/api/notifications` | `auth:sanctum` | `NotificationController@index` | Ambil riwayat notifikasi user |
| **POST** | `/api/category-requests` | `auth:sanctum` | `CategoryRequestController@store` | User mengusulkan kategori baru ke admin |
| **POST** | `/api/categories` | `auth:sanctum` | `CategoryController@store` | (Admin) Buat kategori secara langsung |
| **POST** | `/api/category-requests/{id}/approve` | `auth:sanctum` | `CategoryRequestController@approve` | (Admin) Setujui usulan dan buat kategori |

---

## 6. Cara Setup & Instalasi Lokal

### A. Persyaratan Sistem
*   PHP ^8.1
*   Composer v2
*   Node.js ^18.x & NPM
*   Database: PostgreSQL (disarankan untuk lokal) atau MySQL.

### B. Setup Backend (Laravel)

1. Buka terminal, masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Salin file environment:
   ```bash
   cp .env.example .env
   ```
3. Install dependensi PHP:
   ```bash
   composer install
   ```
4. Konfigurasi isi file `.env` kamu:
   ```env
   APP_NAME="Forum Komunitas"
   APP_ENV=local
   APP_KEY= # (Dibuat otomatis pada langkah 5)
   APP_DEBUG=true
   APP_URL=http://localhost:8000
   FRONTEND_URL=http://localhost:5173

   DB_CONNECTION=pgsql  # (Ubah ke mysql jika menggunakan MySQL/XAMPP)
   DB_HOST=127.0.0.1
   DB_PORT=5432         # (Ubah ke 3306 untuk MySQL)
   DB_DATABASE=forum_db # (Pastikan database ini dibuat di DBMS kamu)
   DB_USERNAME=postgres # (Ubah ke root untuk MySQL lokal)
   DB_PASSWORD=root     # (Ubah menyesuaikan dengan kredensial lokal)

   BROADCAST_DRIVER=log
   CACHE_DRIVER=file
   FILESYSTEM_DISK=public
   QUEUE_CONNECTION=database
   SESSION_DRIVER=database
   SESSION_LIFETIME=120

   # Konfigurasi SMTP untuk OTP & Reset Password
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com # (atau penyedia lain)
   MAIL_PORT=465
   MAIL_USERNAME=email_kamu@gmail.com
   MAIL_PASSWORD=app_password_email_kamu
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@forumkomunitas.xyz
   MAIL_FROM_NAME="${APP_NAME}"
   ```
5. Generate application key:
   ```bash
   php artisan key:generate
   ```
6. Hubungkan folder public storage untuk gambar:
   ```bash
   php artisan storage:link
   ```
7. Jalankan migrasi dan seeder awal:
   ```bash
   php artisan migrate --seed
   ```
8. Jalankan development server backend:
   ```bash
   php artisan serve
   ```
   *(Backend akan berjalan di `http://localhost:8000`)*

### C. Setup Frontend (React / Vite)

1. Buka terminal baru, masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Install dependensi Node.js:
   ```bash
   npm install
   ```
3. Pastikan konfigurasi proxy dan URL di `vite.config.js` dan `src/api/axios.js` sesuai dengan port backend (secara default sudah diarahkan ke `http://localhost:8000`).
4. Jalankan development server frontend:
   ```bash
   npm run dev
   ```
   *(Frontend akan terbuka di `http://localhost:5173`)*

Aplikasi siap digunakan.
