<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThreadImage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['thread_id', 'path'];

    public function thread()
    {
        return $this->belongsTo(Thread::class);
    }
}
