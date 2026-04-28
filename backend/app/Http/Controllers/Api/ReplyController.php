<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReplyResource;
use App\Models\Reply;
use App\Models\ReplyImage;
use App\Models\Thread;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReplyController extends Controller
{
    /**
     * Store a newly created reply (supports multiple image upload).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content'   => 'required|string',
            'thread_id' => 'required|exists:threads,id',
            'parent_id' => 'nullable|exists:replies,id',
            'images'    => 'nullable|array|max:5',
            'images.*'  => 'image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ], [
            'content.required'   => 'Balasan wajib diisi.',
            'thread_id.required' => 'Thread wajib diisi.',
            'thread_id.exists'   => 'Thread tidak ditemukan.',
            'images.max'         => 'Maksimal 5 gambar.',
            'images.*.image'     => 'File harus berupa gambar.',
            'images.*.mimes'     => 'Format gambar harus jpeg, png, jpg, gif, atau webp.',
            'images.*.max'       => 'Ukuran setiap gambar maksimal 3MB.',
        ]);

        $reply = Reply::create([
            'content'   => $request->content,
            'user_id'   => $request->user()->id,
            'thread_id' => $request->thread_id,
            'parent_id' => $request->parent_id,
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('replies', 'public');
                ReplyImage::create(['reply_id' => $reply->id, 'path' => $path]);
            }
        }

        $reply->load(['user', 'parent.user', 'images']);
        $sender = $request->user();
        $thread = Thread::find($request->thread_id);

        // Notification 1: Notify thread owner
        if ($thread && $thread->user_id !== $sender->id) {
            Notification::create([
                'user_id'   => $thread->user_id,
                'sender_id' => $sender->id,
                'type'      => 'reply_thread',
                'message'   => "membalas thread \"{$thread->title}\"",
                'thread_id' => $thread->id,
                'reply_id'  => $reply->id,
            ]);
        }

        // Notification 2: Notify parent reply owner
        if ($request->parent_id) {
            $parentReply = Reply::find($request->parent_id);
            if ($parentReply
                && $parentReply->user_id !== $sender->id
                && $parentReply->user_id !== ($thread?->user_id)) {
                Notification::create([
                    'user_id'   => $parentReply->user_id,
                    'sender_id' => $sender->id,
                    'type'      => 'reply_reply',
                    'message'   => "membalas komentar Anda di \"{$thread->title}\"",
                    'thread_id' => $thread?->id,
                    'reply_id'  => $reply->id,
                ]);
            } elseif ($parentReply
                && $parentReply->user_id !== $sender->id
                && $parentReply->user_id === ($thread?->user_id)) {
                $existingNotif = Notification::where('user_id', $parentReply->user_id)
                    ->where('sender_id', $sender->id)
                    ->where('reply_id', $reply->id)
                    ->where('type', 'reply_thread')
                    ->first();
                if ($existingNotif) {
                    $existingNotif->update([
                        'message' => "membalas komentar Anda di \"{$thread->title}\"",
                        'type'    => 'reply_reply',
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Reply berhasil dibuat.',
            'data'    => new ReplyResource($reply),
        ], 201);
    }

    /**
     * Update the specified reply.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $reply = Reply::findOrFail($id);

        if ($request->user()->id !== $reply->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'content'            => 'required|string',
            'remove_image_ids'   => 'nullable|array',
            'remove_image_ids.*' => 'integer|exists:reply_images,id',
            'images'             => 'nullable|array|max:5',
            'images.*'           => 'image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ]);

        $reply->update(['content' => $request->content]);

        if ($request->has('remove_image_ids')) {
            $removeIds = $request->remove_image_ids;
            $imagesToRemove = ReplyImage::whereIn('id', $removeIds)->where('reply_id', $reply->id)->get();
            foreach ($imagesToRemove as $img) {
                if (\Illuminate\Support\Facades\Storage::disk('public')->exists($img->path)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($img->path);
                }
                $img->delete();
            }
        }

        $currentImageCount = $reply->images()->count();
        if ($request->hasFile('images')) {
            $allowedNewImages = 5 - $currentImageCount;
            $newImages = array_slice($request->file('images'), 0, $allowedNewImages);

            foreach ($newImages as $file) {
                $path = $file->store('replies', 'public');
                ReplyImage::create(['reply_id' => $reply->id, 'path' => $path]);
            }
        }

        $reply->load(['user', 'parent.user', 'images']);

        return response()->json([
            'message' => 'Reply berhasil diupdate.',
            'data'    => new ReplyResource($reply),
        ]);
    }

    /**
     * Remove the specified reply.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $reply = Reply::findOrFail($id);

        if ($request->user()->id !== $reply->user_id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $reply->delete();

        return response()->json([
            'message' => 'Reply berhasil dihapus.',
        ]);
    }
}
