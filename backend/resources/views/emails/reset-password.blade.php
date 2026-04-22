<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Forum Komunitas</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">
                🔑
            </div>
            <h2 style="color: #6366f1; margin: 0; font-size: 22px;">Reset Password</h2>
        </div>

        <p style="color: #333; margin-bottom: 8px;">Halo, <strong>{{ $user->name }}</strong>!</p>
        <p style="color: #555; line-height: 1.6;">
            Anda menerima email ini karena ada permintaan reset password untuk akun Anda di <strong>Forum Komunitas</strong>.
        </p>
        <p style="color: #555; line-height: 1.6;">
            Klik tombol di bawah ini untuk mereset password Anda:
        </p>

        <div style="text-align: center; margin: 32px 0;">
            <a href="{{ $resetUrl }}" 
               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password Saya
            </a>
        </div>

        <p style="color: #666; font-size: 13px; line-height: 1.6;">
            Atau salin dan tempel link berikut ke browser Anda:
        </p>
        <p style="background: #f8f8f8; padding: 12px; border-radius: 6px; font-size: 12px; color: #6366f1; word-break: break-all;">
            {{ $resetUrl }}
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="color: #999; font-size: 12px; line-height: 1.6;">
            ⏰ Link ini akan <strong>kadaluarsa dalam 60 menit</strong>.<br>
            🔒 Jika Anda tidak meminta reset password, abaikan email ini. Akun Anda tetap aman.
        </p>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
            <p style="color: #bbb; font-size: 11px; margin: 0;">
                Forum Komunitas &copy; {{ date('Y') }} &mdash; Semua hak dilindungi
            </p>
        </div>
    </div>
</body>
</html>
