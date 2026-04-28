<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ThreadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'content'       => $this->content,
            'status'        => $this->status ?? 'open',
            'user'          => new UserResource($this->whenLoaded('user')),
            'category'      => new CategoryResource($this->whenLoaded('category')),
            'images'        => $this->whenLoaded('images', function () {
                return $this->images->map(fn($img) => [
                    'id'  => $img->id,
                    'url' => Storage::disk('public')->url($img->path),
                ]);
            }, []),
            'replies_count' => $this->whenCounted('replies'),
            'likes_count'   => $this->whenCounted('likes'),
            'is_liked'      => $user ? $this->isLikedBy($user) : false,
            'created_at'    => $this->created_at->toISOString(),
            'updated_at'    => $this->updated_at->toISOString(),
        ];
    }
}
