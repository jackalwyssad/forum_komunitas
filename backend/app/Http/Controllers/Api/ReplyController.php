<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReplyRequest;
use App\Http\Resources\ReplyResource;
use App\Models\Reply;
use App\Models\Thread;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReplyController extends Controller
{
    /**
     * Store a newly created reply.
     * Creates notifications for:
     * 1. Thread owner (if replier is not the owner)
     * 2. Parent reply owner (if replying to someone else's reply)
     */
    public function store(StoreReplyRequest $request): JsonResponse
    {
        $reply = Reply::create([
            'content'   => $request->content,
            'user_id'   => $request->user()->id,
            'thread_id' => $request->thread_id,
            'parent_id' => $request->parent_id,
        ]);

        $reply->load(['user', 'parent.user']);
        $sender = $request->user();
        $thread = Thread::find($request->thread_id);

        // Notification 1: Notify thread owner when someone replies to their thread
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

        // Notification 2: Notify parent reply owner when someone replies to their reply
        if ($request->parent_id) {
            $parentReply = Reply::find($request->parent_id);
            if ($parentReply
                && $parentReply->user_id !== $sender->id
                && $parentReply->user_id !== ($thread?->user_id)) {
                // Don't send duplicate notification if parent reply owner is also thread owner
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
                // Parent reply owner IS the thread owner — already notified via reply_thread
                // Update the existing notification message to include @mention context
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
     * Only the owner can update.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $reply = Reply::findOrFail($id);

        if ($request->user()->id !== $reply->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        $reply->update(['content' => $request->content]);
        $reply->load(['user', 'parent.user']);

        return response()->json([
            'message' => 'Reply berhasil diupdate.',
            'data'    => new ReplyResource($reply),
        ]);
    }

    /**
     * Remove the specified reply.
     * Owner or admin can delete.
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
