<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reply_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reply_id');
            $table->string('path');
            $table->timestamps();

            $table->foreign('reply_id')->references('id')->on('replies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reply_images');
    }
};
