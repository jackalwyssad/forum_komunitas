<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Step 1 Registrasi: Validasi data, simpan OTP sementara, kirim email.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|min:8|confirmed',
        ], [
            'name.required'         => 'Nama wajib diisi.',
            'email.required'        => 'Email wajib diisi.',
            'email.email'           => 'Format email tidak valid.',
            'email.unique'          => 'Email sudah terdaftar.',
            'password.required'     => 'Password wajib diisi.',
            'password.min'          => 'Password minimal 8 karakter.',
            'password.confirmed'    => 'Konfirmasi password tidak cocok.',
        ]);

        // Hapus OTP lama jika ada
        \Illuminate\Support\Facades\DB::table('email_otps')->where('email', $request->email)->delete();

        // Generate OTP 6 digit
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        \Illuminate\Support\Facades\DB::table('email_otps')->insert([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => $request->password, // plain text, akan di-hash otomatis oleh cast 'hashed' saat User::create()
            'otp'        => $otp,
            'expires_at' => \Carbon\Carbon::now()->addMinutes(10),
            'created_at' => \Carbon\Carbon::now(),
            'updated_at' => \Carbon\Carbon::now(),
        ]);

        // Kirim email OTP
        $name = $request->name;
        \Illuminate\Support\Facades\Mail::send('emails.otp-verification', ['otp' => $otp, 'name' => $name], function ($mail) use ($request, $name) {
            $mail->to($request->email, $name)
                 ->subject('Kode Verifikasi OTP - Forum Komunitas')
                 ->from(config('mail.from.address'), config('mail.from.name'));
        });

        return response()->json([
            'message' => 'Kode OTP telah dikirimkan ke email Anda.',
        ]);
    }

    /**
     * Step 2 Registrasi: Verifikasi OTP, buat akun, kembalikan token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('email_otps')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Data registrasi tidak ditemukan. Silakan daftar ulang.',
            ], 422);
        }

        // Cek kadaluarsa
        if (\Carbon\Carbon::parse($record->expires_at)->isPast()) {
            \Illuminate\Support\Facades\DB::table('email_otps')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Kode OTP sudah kadaluarsa. Silakan daftar ulang.',
            ], 422);
        }

        // Cek OTP
        if ($request->otp !== $record->otp) {
            return response()->json([
                'message' => 'Kode OTP tidak valid.',
            ], 422);
        }

        // Pastikan email belum terdaftar (double check)
        if (User::where('email', $record->email)->exists()) {
            \Illuminate\Support\Facades\DB::table('email_otps')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Email sudah terdaftar. Silakan login.',
            ], 422);
        }

        // Buat user
        $user = User::create([
            'name'     => $record->name,
            'email'    => $record->email,
            'password' => $record->password, // sudah di-hash
            'role'     => 'user',
        ]);

        // Hapus record OTP
        \Illuminate\Support\Facades\DB::table('email_otps')->where('email', $request->email)->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil! Selamat datang.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Update user profile (name, email).
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Profil berhasil diupdate.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama salah.',
                'errors'  => ['current_password' => ['Password lama tidak sesuai.']],
            ], 422);
        }

        $user->update([
            'password' => $request->password,
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah.',
        ]);
    }

    /**
     * Upload / update user avatar.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ], [
            'avatar.required' => 'File foto wajib diupload.',
            'avatar.image'    => 'File harus berupa gambar.',
            'avatar.mimes'    => 'Format gambar harus jpeg, png, jpg, gif, atau webp.',
            'avatar.max'      => 'Ukuran gambar maksimal 2MB.',
        ]);

        $user = $request->user();

        // Hapus avatar lama jika ada
        if ($user->avatar) {
            // Avatar tersimpan sebagai full URL: https://domain.xyz/uploads/avatars/...
            // Ubah ke relative path: avatars/filename.ext
            $storageBaseUrl = Storage::disk('public')->url('');
            $oldRelativePath = ltrim(str_replace($storageBaseUrl, '', $user->avatar), '/');
            if ($oldRelativePath) {
                Storage::disk('public')->delete($oldRelativePath);
            }
        }

        // Store avatar baru
        $file     = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path     = $file->storeAs('avatars', $filename, 'public');

        // Simpan full URL agar konsisten dengan thread/reply images
        $user->update([
            'avatar' => Storage::disk('public')->url($path),
        ]);

        return response()->json([
            'message' => 'Foto profil berhasil diupdate.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }

    /**
     * Remove user avatar.
     */
    public function removeAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            $storageBaseUrl = Storage::disk('public')->url('');
            $oldRelativePath = ltrim(str_replace($storageBaseUrl, '', $user->avatar), '/');
            if ($oldRelativePath) {
                Storage::disk('public')->delete($oldRelativePath);
            }

            $user->update(['avatar' => null]);
        }

        return response()->json([
            'message' => 'Foto profil berhasil dihapus.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }
}
