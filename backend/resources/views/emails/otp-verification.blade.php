<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Email - Forum Komunitas</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

        <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: inline-flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 12px;">
                ✉️
            </div>
            <h2 style="color: #6366f1; margin: 0; font-size: 22px;">Verifikasi Email Anda</h2>
        </div>

        <p style="color: #333; margin-bottom: 8px;">Halo, <strong>{{ $name }}</strong>!</p>
        <p style="color: #555; line-height: 1.6;">
            Terima kasih telah mendaftar di <strong>Forum Komunitas</strong>. Gunakan kode OTP berikut untuk menyelesaikan pendaftaran Anda.
        </p>

        <div style="text-align: center; margin: 32px 0;">
            <p style="color: #666; font-size: 14px; margin-bottom: 12px;">Kode Verifikasi OTP Anda:</p>
            <div style="display: inline-block; background: linear-gradient(135deg, #f0f0ff, #ede9fe); border: 2px solid #6366f1; border-radius: 12px; padding: 20px 40px;">
                <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #6366f1; font-family: 'Courier New', monospace;">{{ $otp }}</span>
            </div>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="color: #999; font-size: 12px; line-height: 1.6;">
            ⏰ Kode ini akan <strong>kadaluarsa dalam 10 menit</strong>.<br>
            🔒 Jika Anda tidak melakukan pendaftaran ini, abaikan email ini.
        </p>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
            <p style="color: #bbb; font-size: 11px; margin: 0;">
                Forum Komunitas &copy; {{ date('Y') }} &mdash; Semua hak dilindungi
            </p>
        </div>
    </div>
</body>
</html>
