<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');         // Penerima notifikasi
            $table->uuid('sender_id');       // Pengirim notifikasi
            $table->string('type');          // reply_thread, reply_reply, thread_liked
            $table->text('message');
            $table->uuid('thread_id')->nullable();
            $table->uuid('reply_id')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('thread_id')->references('id')->on('threads')->onDelete('cascade');
            $table->foreign('reply_id')->references('id')->on('replies')->onDelete('set null');

            $table->index(['user_id', 'read_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
