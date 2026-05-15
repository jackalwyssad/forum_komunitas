<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'type'              => $this->type,
            'message'           => $this->message,
            'sender'            => [
                'id'     => $this->sender?->id,
                'name'   => $this->sender?->name,
                'avatar' => $this->sender?->avatar ? url($this->sender->avatar) : null,
            ],
            'thread_id'         => $this->thread_id,
            'thread'            => $this->whenLoaded('thread', function () {
                return [
                    'id'    => $this->thread->id,
                    'title' => $this->thread->title,
                ];
            }),
            'reply_id'          => $this->reply_id,
            // Preview isi balasan (maks 80 karakter) + jumlah gambar balasan
            'reply_preview'     => $this->whenLoaded('reply', function () {
                return $this->reply?->content
                    ? mb_strimwidth($this->reply->content, 0, 80, '...')
                    : null;
            }),
            'reply_images_count' => $this->whenLoaded('reply', function () {
                return $this->reply?->images?->count() ?? 0;
            }),
            'is_read'           => $this->read_at !== null,
            'read_at'           => $this->read_at?->toISOString(),
            'created_at'        => $this->created_at->toISOString(),
        ];
    }
}
