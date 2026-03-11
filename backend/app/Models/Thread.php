<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Thread extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'title',
        'content',
        'user_id',
        'category_id',
    ];

    /**
     * Boot: cascade delete replies, likes, and notifications when thread is deleted.
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function (Thread $thread) {
            // Delete all replies (each reply's boot handles children + notifications)
            foreach ($thread->replies as $reply) {
                $reply->delete();
            }

            // Delete likes
            $thread->likes()->delete();

            // Delete thread-level notifications
            Notification::where('thread_id', $thread->id)->delete();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function replies()
    {
        return $this->hasMany(Reply::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }
}
