<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'sender_id',
        'type',
        'message',
        'thread_id',
        'reply_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function thread()
    {
        return $this->belongsTo(Thread::class);
    }

    public function reply()
    {
        return $this->belongsTo(Reply::class);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }
}
