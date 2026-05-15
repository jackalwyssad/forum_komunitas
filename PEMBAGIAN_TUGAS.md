# 📋 Dokumentasi Tugas & Implementasi — Forum Komunitas

> Dokumen ini menjelaskan pembagian tugas tim beserta bukti implementasi nyata dalam project **Forum Komunitas** (Full Stack — Semester 4).

---

## 👥 Tugas Bersama

### 1. Tema Project

**Forum Diskusi Komunitas** — platform web untuk berdiskusi, berbagi informasi, dan berinteraksi antar anggota komunitas.

**Fitur utama:**
- Registrasi & login dengan verifikasi OTP via email
- Membuat, membaca, mengedit, dan menghapus thread diskusi
- Sistem balasan bersarang (threaded replies) dengan @mention
- Upload gambar di thread dan komentar
- Like thread, notifikasi real-time, dark/light mode
- Moderasi konten oleh admin (hapus dengan alasan + notifikasi otomatis)
- Pengajuan dan persetujuan kategori baru

---

### 2. Alur Sistem

Alur sistem menggambarkan proses teknis yang terjadi di balik layar saat user berinteraksi dengan aplikasi.

#### Registrasi dengan OTP
```
User isi form (nama, email, password)
      ↓
POST /api/register/send-otp
      ↓
Backend generate OTP 6 digit → simpan ke tabel email_otps → kirim ke email
      ↓
User masukkan OTP dari email
      ↓
POST /api/register/verify-otp
      ↓
Backend cek OTP valid & belum expired → buat akun di tabel users
      ↓
Backend return token (Sanctum) → Frontend simpan di localStorage → user masuk
```

#### Membuat Thread
```
User submit form thread
      ↓
Frontend validasi (judul min 10 karakter, konten min 30, kategori wajib dipilih)
      ↓
POST /api/threads (data teks saja — cepat)
      ↓
Backend validasi → simpan ke tabel threads → return data thread
      ↓
Frontend redirect ke halaman thread baru
      ↓ (background — tidak blokir user)
Frontend upload foto → PUT /api/threads/{id}
      ↓
Backend simpan foto ke storage → catat di tabel thread_images
```

#### Sistem Notifikasi
```
User A balas thread / komentar User B
      ↓
Backend simpan reply → buat record di tabel notifications (untuk User B)
      ↓
Navbar User B polling tiap 30 detik → GET /api/notifications/unread-count
      ↓
Badge merah muncul → User B buka halaman notifikasi
      ↓
GET /api/notifications → tampil daftar notif → klik → navigate ke thread
```

#### Moderasi Admin
```
Admin klik 🗑 Hapus pada konten milik user lain
      ↓
Modal alasan muncul → admin wajib pilih alasan (preset atau kustom)
      ↓
DELETE /api/threads/{id} atau /api/replies/{id} + { reason: "..." }
      ↓
Backend validasi reason → hapus konten dari DB
Backend kirim notifikasi thread_deleted ke pemilik & semua komentator
      ↓
User terdampak terima notif merah: "Admin menghapus... Alasan: ..."
```

---

### 3. Flow Aplikasi

Flow aplikasi menggambarkan navigasi user dari satu halaman ke halaman lain.

```
Buka forumkomunitas.xyz
          ↓
    [Landing Page]
          ↓
    ┌─────┴──────┐
    ↓            ↓
 [Login]     [Register]
    │        Step 1: Isi form
    │        Step 2: Verifikasi OTP
    └────┬────────┘
         ↓
   [Forum / Beranda]  ← daftar thread, search, filter kategori
         ↓
   [Thread Detail]    ← isi thread, balasan bersarang, like, komentar
         │
    ┌────┴──────────────────┐
    ↓                       ↓
[Balas / Komentar]    [Edit / Hapus]
                       (admin → modal alasan)

Navbar:
  🔔 → [Notifications Page]  ← daftar notif, klik → thread terkait
  👤 → [Settings Page]       ← edit profil, ganti password
  (Admin) → [Kelola Kategori] ← CRUD kategori + approve/reject usulan
```

---

### 4. Integrasi Frontend dan Backend

Frontend (React) berkomunikasi dengan Backend (Laravel) menggunakan **REST API** via **Axios**.

**Konfigurasi Axios** (`frontend/src/api/axios.js`):
```js
const api = axios.create({
  baseURL: 'https://forumkomunitas.xyz/api',
  headers: { 'Content-Type': 'application/json' }
});

// Sisipkan token otomatis di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Contoh integrasi GET data:**
```jsx
// Frontend mengambil data thread dari backend
useEffect(() => {
  api.get('/threads').then(res => setThreads(res.data.data));
}, []);
```

**Contoh integrasi POST data:**
```jsx
// Frontend kirim data thread baru ke backend
await api.post('/threads', {
  title: form.title,
  content: form.content,
  category_id: form.category_id
});
```

---

### 5. Testing Keseluruhan Sistem

Testing dilakukan secara manual menggunakan:

| Tool | Digunakan untuk |
|------|----------------|
| **Browser** | Testing tampilan, navigasi, responsif |
| **Postman** | Testing semua endpoint API backend |
| `php artisan serve` | Jalankan backend lokal |
| `npm run dev` | Jalankan frontend lokal |

**Skenario yang diuji:**
- Registrasi dengan OTP valid & tidak valid
- Login dengan kredensial benar & salah
- Buat thread dengan data lengkap & tidak lengkap
- Upload gambar (format valid & tidak valid)
- Komentar bersarang & notifikasi
- Hapus konten sebagai admin (dengan alasan)
- Respon 401 saat token tidak valid → logout otomatis
- Akses halaman admin tanpa role admin → redirect

---

### 6. Dokumentasi Project

Dokumentasi tersedia dalam beberapa file:

| File | Isi |
|------|-----|
| `README.md` | Overview project, fitur utama, API endpoint, cara install |
| `README_Keseluruhan.md` | Penjelasan detail setiap file & fungsinya |
| `README_cara_kerja.md` | Cara kerja teknis, skema database, alur request |
| `PANDUAN_KOLABORASI.md` | Panduan Git, branching, dan workflow tim |
| `PEMBAGIAN_TUGAS.md` | Dokumen ini — tugas tim & implementasi |

---

### 7. Presentasi

Poin yang akan dipresentasikan:
1. Latar belakang & tujuan aplikasi
2. Teknologi yang digunakan (Laravel + React)
3. Alur sistem & flow aplikasi (diagram)
4. Demo fitur utama (live demo)
5. Tantangan & solusi selama pengembangan
6. Kesimpulan & rencana pengembangan ke depan

---

## 🎨 Jobdesk Frontend

### 1. Desain Tampilan Aplikasi (Layout & Responsif)

Desain diimplementasikan menggunakan **Vanilla CSS** dengan CSS Custom Properties untuk sistem tema.

**File utama:** `frontend/src/index.css`

```css
/* Sistem warna menggunakan CSS Variables */
:root {
  --primary: #6366f1;
  --bg-primary: #0f0f1a;
  --text-primary: #f1f5f9;
}

/* Responsif menggunakan media query */
@media (max-width: 768px) {
  .navbar-nav { display: none; }
  .menu-toggle { display: flex; }
}
```

**Komponen yang didesain:**
- Navbar dengan hamburger menu (mobile)
- Card thread dengan grid gambar
- Modal overlay (hapus, alasan moderasi)
- Lightbox galeri gambar
- Dark/Light mode toggle

---

### 2. Membuat Komponen UI

Komponen reusable tersedia di `frontend/src/components/`:

| Komponen | Fungsi |
|----------|--------|
| `Alert.jsx` | Pop-up notifikasi success/error/warning |
| `ConfirmDialog.jsx` | Modal konfirmasi sebelum aksi hapus |
| `Navbar.jsx` | Navigasi global dengan badge notifikasi |
| `ProtectedRoute.jsx` | Pembatas akses halaman berdasarkan role |
| `OtpInput.jsx` | Input 6 digit OTP dengan auto-focus |
| `PasswordInput.jsx` | Input password dengan toggle lihat/sembunyikan |

**Contoh penggunaan `ConfirmDialog`:**
```jsx
<ConfirmDialog
  isOpen={confirmDelete}
  title="Hapus Thread"
  message="Yakin ingin menghapus thread ini?"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setConfirmDelete(false)}
/>
```

---

### 3. Menghubungkan Tampilan dengan API

Setiap halaman mengambil dan mengirim data ke backend melalui instance Axios (`api`).

**Contoh di `ThreadsPage.jsx`:**
```jsx
// Ambil daftar thread saat halaman dimuat
useEffect(() => {
  api.get(`/threads?page=${page}&search=${search}&category=${categoryId}`)
    .then(res => {
      setThreads(res.data.data);
      setMeta(res.data.meta);
    });
}, [page, search, categoryId]);
```

**Contoh di `ThreadDetailPage.jsx`:**
```jsx
// Kirim komentar baru
const handleReply = async (e) => {
  e.preventDefault();
  const res = await api.post('/replies', {
    content: replyContent,
    thread_id: id,
    parent_id: replyingTo?.id
  });
  setReplies(prev => [...prev, res.data.data]);
};
```

---

### 4. Validasi Input Data

Validasi dilakukan di frontend sebelum data dikirim ke server.

**Contoh di `CreateThreadPage.jsx`:**
```jsx
const TITLE_MIN = 10;
const TITLE_MAX = 255;
const CONTENT_MIN = 30;

const validate = () => {
  const errs = {};
  if (!form.title.trim())
    errs.title = 'Judul wajib diisi';
  else if (form.title.length < TITLE_MIN)
    errs.title = `Judul minimal ${TITLE_MIN} karakter`;
  else if (form.title.length > TITLE_MAX)
    errs.title = `Judul maksimal ${TITLE_MAX} karakter`;

  if (!form.content.trim())
    errs.content = 'Konten wajib diisi';
  else if (form.content.length < CONTENT_MIN)
    errs.content = `Konten minimal ${CONTENT_MIN} karakter`;

  if (!form.category_id)
    errs.category_id = 'Pilih kategori terlebih dahulu';

  return errs;
};
```

**Validasi gambar:**
```jsx
const MAX_IMAGE_SIZE_MB = 1;

if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
  setError('Ukuran gambar maksimal 1 MB');
  return;
}
if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
  setError('Format gambar tidak didukung');
  return;
}
```

---

### 5. Menampilkan Data dari Backend

Data dari backend ditampilkan menggunakan React State dan conditional rendering.

**Contoh menampilkan thread dengan loading state:**
```jsx
if (loading) return <div className="spinner" />;
if (!threads.length) return <p>Belum ada thread.</p>;

return threads.map(thread => (
  <div key={thread.id} className="thread-card">
    <h3>{thread.title}</h3>
    <p>{thread.content}</p>
    <span>{thread.likes_count} Like • {thread.replies_count} Balasan</span>
  </div>
));
```

**Contoh menampilkan error dari backend (validasi 422):**
```jsx
} catch (err) {
  if (err.response?.status === 422) {
    const backendErrors = err.response.data.errors;
    setErrors({
      title: backendErrors.title?.[0],
      content: backendErrors.content?.[0],
    });
  }
}
```

---

### 6. Testing Tampilan

Testing dilakukan secara manual:
- Cek tampilan di berbagai ukuran layar (mobile 360px, tablet 768px, desktop 1280px)
- Cek dark mode & light mode
- Cek transisi animasi dan hover effect
- Cek loading state saat data sedang diambil
- Cek pesan error muncul di field yang tepat

---

## ⚙️ Jobdesk Backend

### 1. Membuat Struktur Database

Database menggunakan **PostgreSQL** dengan skema:

**Tabel utama:**

| Tabel | Fungsi |
|-------|--------|
| `users` | Data akun pengguna (UUID, nama, email, role, avatar) |
| `email_otps` | Data sementara saat registrasi (nama, email, OTP, expired) |
| `password_reset_tokens` | Token reset password (berlaku 10 menit) |
| `threads` | Topik diskusi utama |
| `thread_images` | Lampiran gambar thread |
| `replies` | Balasan/komentar (dengan parent_id untuk nesting) |
| `reply_images` | Lampiran gambar komentar |
| `likes` | Pivot tabel like thread |
| `categories` | Kategori forum |
| `category_requests` | Usulan kategori baru dari user |
| `notifications` | Riwayat notifikasi user |

**Contoh migrasi `threads`:**
```php
Schema::create('threads', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title');
    $table->text('content');
    $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('category_id')->constrained()->cascadeOnDelete();
    $table->string('status')->default('open');
    $table->timestamps();
});
```

---

### 2. Membuat API Server

API dibangun menggunakan **Laravel 10** dengan endpoint RESTful.

**File routing:** `backend/routes/api.php`

```php
// Public — bisa diakses tanpa login
Route::get('/threads', [ThreadController::class, 'index']);
Route::get('/threads/{id}', [ThreadController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected — wajib login (Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/threads', [ThreadController::class, 'store']);
    Route::post('/replies', [ReplyController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    // ... dan seterusnya
});
```

---

### 3. Mengelola Database

Data diakses dan dikelola menggunakan **Eloquent ORM**.

**Contoh relasi di Model:**
```php
// Thread.php
class Thread extends Model
{
    public function user()    { return $this->belongsTo(User::class); }
    public function replies() { return $this->hasMany(Reply::class); }
    public function images()  { return $this->hasMany(ThreadImage::class); }
    public function likes()   { return $this->hasMany(Like::class); }

    // Cascade delete: hapus thread → hapus semua reply & gambar
    protected static function boot() {
        parent::boot();
        static::deleting(fn($t) => $t->replies()->each->delete());
    }
}
```

---

### 4. Membuat Autentikasi

Autentikasi menggunakan **Laravel Sanctum** (token-based).

```php
// Login → return token
public function login(Request $request)
{
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Email atau password salah.'], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json(['user' => $user, 'token' => $token]);
}

// Logout → hapus token
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logout berhasil.']);
}
```

---

### 5. Membuat Validasi Data dari Frontend

Backend memvalidasi semua data yang masuk — tidak bisa dibypass meski user memanipulasi frontend.

**Contoh validasi di `ThreadController`:**
```php
public function store(Request $request)
{
    $request->validate([
        'title'       => 'required|string|min:10|max:255',
        'content'     => 'required|string|min:30',
        'category_id' => 'required|exists:categories,id',
        'images.*'    => 'image|mimes:jpeg,png,webp|max:512', // maks 512KB
    ], [
        'title.required'      => 'Judul wajib diisi.',
        'title.min'           => 'Judul minimal 10 karakter.',
        'category_id.exists'  => 'Kategori tidak valid.',
    ]);

    // Kalau gagal → Laravel return HTTP 422 + pesan error JSON otomatis
    // Kalau lolos → lanjut simpan ke DB
}
```

**Validasi khusus moderasi admin:**
```php
// Admin wajib isi alasan saat hapus konten orang lain
if (!$isOwner && $admin->isAdmin()) {
    $request->validate([
        'reason' => 'required|string|max:500',
    ], [
        'reason.required' => 'Alasan penghapusan wajib diisi.',
    ]);
}
```

---

### 6. Testing API

Testing API menggunakan **Postman**.

**Yang diuji:**

| Endpoint | Test Case |
|----------|-----------|
| `POST /api/login` | Kredensial benar ✅, salah ❌, field kosong ❌ |
| `POST /api/threads` | Data lengkap ✅, judul < 10 karakter ❌, tanpa token ❌ |
| `DELETE /api/threads/{id}` | Admin dengan reason ✅, tanpa reason ❌, bukan admin ❌ |
| `GET /api/notifications` | Dengan token valid ✅, tanpa token → 401 ❌ |
| `POST /api/register/verify-otp` | OTP benar ✅, OTP salah ❌, OTP expired ❌ |

**Respons backend saat validasi gagal:**
```json
HTTP 422 Unprocessable Entity
{
  "message": "The title field must be at least 10 characters.",
  "errors": {
    "title": ["The title field must be at least 10 characters."],
    "category_id": ["The category id field is required."]
  }
}
```

---

*Dokumen ini dibuat untuk keperluan tugas mata kuliah Full Stack Development — Semester 4.*
