<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('replies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('content');
            $table->uuid('user_id');
            $table->uuid('thread_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('thread_id')->references('id')->on('threads')->onDelete('cascade');

            $table->index('user_id');
            $table->index('thread_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('replies');
    }
};
