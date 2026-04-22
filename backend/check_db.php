<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Users: " . App\Models\User::count() . "\n";
echo "Categories: " . App\Models\Category::count() . "\n";
echo "Threads: " . App\Models\Thread::count() . "\n";
echo "Replies: " . App\Models\Reply::count() . "\n";
echo "Likes: " . App\Models\Like::count() . "\n";

$admin = App\Models\User::where('email', 'admin@forum.com')->first();
if ($admin) {
    echo "Admin password hash: " . $admin->password . "\n";
} else {
    echo "Admin not found\n";
}
