<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Selalu balas sukses meski email tidak ada (keamanan)
        if (!$user) {
            return response()->json([
                'message' => 'Jika email terdaftar, link reset akan dikirimkan.',
            ]);
        }

        // Hapus token lama & buat token baru
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $request->email,
            'token'      => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Kirim email
        $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        Mail::send('emails.reset-password', ['resetUrl' => $resetUrl, 'user' => $user], function ($mail) use ($user) {
            $mail->to($user->email, $user->name)
                 ->subject('Reset Password - Forum Komunitas')
                 ->from(config('mail.from.address'), config('mail.from.name'));
        });

        return response()->json([
            'message' => 'Link reset password telah dikirimkan ke email Anda.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Token tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        // Token kadaluarsa setelah 10 menit
        if (Carbon::parse($record->created_at)->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'LINK_EXPIRED',
            ], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => $request->password]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password berhasil direset! Silakan login dengan password baru Anda.',
        ]);
    }
}
