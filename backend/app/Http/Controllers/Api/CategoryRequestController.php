<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryRequestController extends Controller
{
    /**
     * List requests:
     * - Admin: semua request, diurutkan pending dulu
     * - User biasa: hanya milik sendiri
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $requests = CategoryRequest::with('user')
                ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $requests = CategoryRequest::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json(['data' => $requests]);
    }

    /**
     * User mengajukan request kategori baru.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'name.max'      => 'Nama kategori maksimal 100 karakter.',
            'description.max' => 'Deskripsi maksimal 500 karakter.',
        ]);

        // Cek apakah user sudah ada pending request dengan nama yang sama (case-insensitive)
        $existing = CategoryRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->whereRaw('LOWER(name) = LOWER(?)', [$request->name])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Kamu sudah memiliki request kategori dengan nama tersebut yang sedang menunggu persetujuan.',
            ], 422);
        }

        $catRequest = CategoryRequest::create([
            'user_id'     => $user->id,
            'name'        => $request->name,
            'description' => $request->description,
            'status'      => 'pending',
        ]);

        // Kirim notifikasi ke semua admin
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id'   => $admin->id,
                'sender_id' => $user->id,
                'type'      => 'category_request_new',
                'message'   => "mengusulkan kategori baru: \"{$catRequest->name}\". Tinjau dan setujui atau tolak usulan ini.",
            ]);
        }

        return response()->json([
            'message' => 'Usulan kategori berhasil dikirim! Admin akan segera meninjau usulan kamu.',
            'data'    => $catRequest,
        ], 201);
    }

    /**
     * Admin menyetujui request → buat kategori baru + kirim notifikasi ke user.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $catRequest = CategoryRequest::findOrFail($id);

        if ($catRequest->status !== 'pending') {
            return response()->json(['message' => 'Request ini sudah diproses sebelumnya.'], 422);
        }

        // Buat kategori baru
        $category = Category::create([
            'name'        => $catRequest->name,
            'description' => $catRequest->description,
            'is_public'   => true,
        ]);

        // Update status request
        $catRequest->update(['status' => 'approved']);

        // Kirim notifikasi ke user
        Notification::create([
            'user_id'   => $catRequest->user_id,
            'sender_id' => $admin->id,
            'type'      => 'category_request_approved',
            'message'   => "usulan kategori \"{$catRequest->name}\" kamu telah disetujui! Kategori baru sudah tersedia.",
        ]);

        return response()->json([
            'message'  => 'Request disetujui dan kategori berhasil dibuat.',
            'category' => $category,
        ]);
    }

    /**
     * Admin menolak request + kirim notifikasi dengan alasan (opsional).
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $admin = $request->user();

        if (!$admin->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'admin_note' => 'nullable|string|max:300',
        ]);

        $catRequest = CategoryRequest::findOrFail($id);

        if ($catRequest->status !== 'pending') {
            return response()->json(['message' => 'Request ini sudah diproses sebelumnya.'], 422);
        }

        $catRequest->update([
            'status'     => 'rejected',
            'admin_note' => $request->admin_note,
        ]);

        // Pesan notifikasi
        $notifMsg = "usulan kategori \"{$catRequest->name}\" kamu tidak dapat disetujui.";
        if ($request->admin_note) {
            $notifMsg .= " Alasan: {$request->admin_note}";
        }

        // Kirim notifikasi ke user
        Notification::create([
            'user_id'   => $catRequest->user_id,
            'sender_id' => $admin->id,
            'type'      => 'category_request_rejected',
            'message'   => $notifMsg,
        ]);

        return response()->json([
            'message' => 'Request berhasil ditolak.',
        ]);
    }
}
