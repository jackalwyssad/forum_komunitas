<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Reply extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'content',
        'user_id',
        'thread_id',
        'parent_id',
    ];

    /**
     * Boot: cascade delete children replies, images, and related notifications.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function (Reply $reply) {
            // Recursively delete all child replies first
            foreach ($reply->children as $child) {
                $child->delete();
            }

            // Delete reply images from storage
            foreach ($reply->images as $image) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            }

            // Delete all notifications that reference this reply
            Notification::where('reply_id', $reply->id)->delete();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function thread()
    {
        return $this->belongsTo(Thread::class);
    }

    public function parent()
    {
        return $this->belongsTo(Reply::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Reply::class, 'parent_id');
    }

    public function images()
    {
        return $this->hasMany(ReplyImage::class);
    }
}
