<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReplyImage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['reply_id', 'path'];

    public function reply()
    {
        return $this->belongsTo(Reply::class);
    }
}
