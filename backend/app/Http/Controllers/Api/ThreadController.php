<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ThreadResource;
use App\Http\Resources\ReplyResource;
use App\Models\Thread;
use App\Models\ThreadImage;
use App\Models\Like;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ThreadController extends Controller
{
    /**
     * Display a paginated listing of threads.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Thread::with(['user', 'category', 'images'])
            ->withCount(['replies', 'likes']);

        if ($request->has('search') && $request->search) {
            $query->where('title', 'ilike', '%' . $request->search . '%');
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $threads = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'data' => ThreadResource::collection($threads),
            'meta' => [
                'current_page' => $threads->currentPage(),
                'last_page'    => $threads->lastPage(),
                'per_page'     => $threads->perPage(),
                'total'        => $threads->total(),
            ],
        ]);
    }

    /**
     * Store a newly created thread (supports multiple image upload).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|min:10|max:255',
            'content'     => 'required|string|min:30',
            'category_id' => 'required|exists:categories,id',
            'images'      => 'nullable|array|max:5',
            'images.*'    => 'image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ], [
            'title.required'       => 'Judul wajib diisi.',
            'title.min'            => 'Judul minimal 10 karakter.',
            'content.required'     => 'Konten wajib diisi.',
            'content.min'          => 'Konten minimal 30 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak valid.',
            'images.max'           => 'Maksimal 5 gambar.',
            'images.*.image'       => 'File harus berupa gambar.',
            'images.*.mimes'       => 'Format gambar harus jpeg, png, jpg, gif, atau webp.',
            'images.*.max'         => 'Ukuran setiap gambar maksimal 3MB.',
        ]);

        $thread = Thread::create([
            'title'       => $request->title,
            'content'     => $request->content,
            'user_id'     => $request->user()->id,
            'category_id' => $request->category_id,
            'status'      => 'open',
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('threads', 'public');
                ThreadImage::create(['thread_id' => $thread->id, 'path' => $path]);
            }
        }

        $thread->load(['user', 'category', 'images']);
        $thread->loadCount(['replies', 'likes']);

        return response()->json([
            'message' => 'Thread berhasil dibuat.',
            'data'    => new ThreadResource($thread),
        ], 201);
    }

    /**
     * Display the specified thread with its replies.
     */
    public function show(string $id): JsonResponse
    {
        $thread = Thread::with(['user', 'category', 'images'])
            ->withCount(['replies', 'likes'])
            ->findOrFail($id);

        return response()->json([
            'data'    => new ThreadResource($thread),
            'replies' => ReplyResource::collection(
                $thread->replies()
                    ->with(['user', 'parent.user', 'images'])
                    ->orderBy('created_at', 'asc')
                    ->get()
            ),
        ]);
    }

    /**
     * Update the specified thread. Supports adding/removing images.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);

        if ($request->user()->id !== $thread->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'title'            => 'sometimes|string|min:10|max:255',
            'content'          => 'sometimes|string|min:30',
            'category_id'      => 'sometimes|exists:categories,id',
            'images'           => 'nullable|array|max:5',
            'images.*'         => 'image|mimes:jpeg,png,jpg,gif,webp|max:3072',
            'remove_image_ids' => 'nullable|array',
            'remove_image_ids.*' => 'string',
        ]);

        $thread->update($request->only('title', 'content', 'category_id'));

        // Remove specific images
        if ($request->has('remove_image_ids') && is_array($request->remove_image_ids)) {
            $imagesToRemove = ThreadImage::where('thread_id', $thread->id)
                ->whereIn('id', $request->remove_image_ids)
                ->get();
            foreach ($imagesToRemove as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }

        // Add new images
        if ($request->hasFile('images')) {
            $currentCount = $thread->images()->count();
            $allowed = 5 - $currentCount;
            foreach (array_slice($request->file('images'), 0, $allowed) as $file) {
                $path = $file->store('threads', 'public');
                ThreadImage::create(['thread_id' => $thread->id, 'path' => $path]);
            }
        }

        $thread->load(['user', 'category', 'images']);
        $thread->loadCount(['replies', 'likes']);

        return response()->json([
            'message' => 'Thread berhasil diupdate.',
            'data'    => new ThreadResource($thread),
        ]);
    }

    /**
     * Change thread status (only owner can do this).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);

        if ($request->user()->id !== $thread->user_id) {
            return response()->json(['message' => 'Hanya pemilik thread yang dapat mengubah status.'], 403);
        }

        $request->validate([
            'status' => 'required|in:open,solved,closed',
        ]);

        $thread->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status thread berhasil diubah.',
            'status'  => $thread->status,
        ]);
    }

    /**
     * Remove the specified thread.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);

        if ($request->user()->id !== $thread->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $thread->delete();

        return response()->json([
            'message' => 'Thread berhasil dihapus.',
        ]);
    }

    /**
     * Like or unlike a thread (toggle).
     */
    public function toggleLike(Request $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);
        $user = $request->user();

        $existingLike = Like::where('user_id', $user->id)
            ->where('thread_id', $thread->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $message = 'Like dibatalkan.';
            $isLiked = false;
        } else {
            Like::create([
                'user_id'   => $user->id,
                'thread_id' => $thread->id,
            ]);
            $message = 'Thread berhasil dilike.';
            $isLiked = true;

            if ($thread->user_id !== $user->id) {
                Notification::create([
                    'user_id'   => $thread->user_id,
                    'sender_id' => $user->id,
                    'type'      => 'thread_liked',
                    'message'   => "menyukai thread \"{$thread->title}\"",
                    'thread_id' => $thread->id,
                ]);
            }
        }

        return response()->json([
            'message'     => $message,
            'is_liked'    => $isLiked,
            'likes_count' => $thread->likes()->count(),
        ]);
    }
}
