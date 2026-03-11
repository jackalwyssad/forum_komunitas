<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreThreadRequest;
use App\Http\Requests\UpdateThreadRequest;
use App\Http\Resources\ThreadResource;
use App\Http\Resources\ReplyResource;
use App\Models\Thread;
use App\Models\Like;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThreadController extends Controller
{
    /**
     * Display a paginated listing of threads.
     * Supports search by title and filter by category_id.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Thread::with(['user', 'category'])
            ->withCount(['replies', 'likes']);

        // Search by title
        if ($request->has('search') && $request->search) {
            $query->where('title', 'ilike', '%' . $request->search . '%');
        }

        // Filter by category
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
     * Store a newly created thread.
     */
    public function store(StoreThreadRequest $request): JsonResponse
    {
        $thread = Thread::create([
            'title'       => $request->title,
            'content'     => $request->content,
            'user_id'     => $request->user()->id,
            'category_id' => $request->category_id,
        ]);

        $thread->load(['user', 'category']);
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
        $thread = Thread::with(['user', 'category', 'replies.user'])
            ->withCount(['replies', 'likes'])
            ->findOrFail($id);

        return response()->json([
            'data'    => new ThreadResource($thread),
            'replies' => ReplyResource::collection(
                $thread->replies()
                    ->with(['user', 'parent.user'])
                    ->orderBy('created_at', 'asc')
                    ->get()
            ),
        ]);
    }

    /**
     * Update the specified thread.
     * Only the owner can update.
     */
    public function update(UpdateThreadRequest $request, string $id): JsonResponse
    {
        $thread = Thread::findOrFail($id);

        if ($request->user()->id !== $thread->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $thread->update($request->validated());
        $thread->load(['user', 'category']);
        $thread->loadCount(['replies', 'likes']);

        return response()->json([
            'message' => 'Thread berhasil diupdate.',
            'data'    => new ThreadResource($thread),
        ]);
    }

    /**
     * Remove the specified thread.
     * Owner or admin can delete.
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

            // Notify thread owner
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
