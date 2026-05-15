<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {

        return [
            'id'         => $this->id,
            'content'    => $this->content,
            'user'       => new UserResource($this->whenLoaded('user')),
            'thread_id'  => $this->thread_id,
            'thread'     => $this->whenLoaded('thread', fn() => $this->thread ? [
                'id'    => $this->thread->id,
                'title' => $this->thread->title,
            ] : null),
            'parent_id'  => $this->parent_id,
            'reply_to'   => $this->whenLoaded('parent', function () {
                return $this->parent ? [
                    'id'   => $this->parent->id,
                    'user' => $this->parent->user ? [
                        'id'   => $this->parent->user->id,
                        'name' => $this->parent->user->name,
                    ] : null,
                ] : null;
            }),
            'images'     => $this->whenLoaded('images', function () {
                return $this->images->map(fn($img) => [
                    'id'  => $img->id,
                    'url' => Storage::disk('public')->url($img->path),
                ]);
            }, []),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
