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
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'role'     => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil.',
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

        // Delete old avatar if exists
        if ($user->avatar) {
            $oldPath = str_replace('/storage/', '', $user->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        // Store new avatar
        $file = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('avatars', $filename, 'public');

        $user->update([
            'avatar' => '/storage/' . $path,
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
            $oldPath = str_replace('/storage/', '', $user->avatar);
            Storage::disk('public')->delete($oldPath);

            $user->update(['avatar' => null]);
        }

        return response()->json([
            'message' => 'Foto profil berhasil dihapus.',
            'user'    => new UserResource($user->fresh()),
        ]);
    }
}
