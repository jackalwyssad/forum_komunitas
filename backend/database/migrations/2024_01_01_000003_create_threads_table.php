<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('threads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('content');
            $table->uuid('user_id');
            $table->uuid('category_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');

            $table->index('title');
            $table->index('user_id');
            $table->index('category_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('threads');
    }
};
