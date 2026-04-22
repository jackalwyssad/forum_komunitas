<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$credentials = ['email' => 'admin@forum.com', 'password' => 'password123'];

if (Auth::attempt($credentials)) {
    echo "Login successful for admin@forum.com!\n";
} else {
    echo "Login completely failed for admin@forum.com.\n";
}
