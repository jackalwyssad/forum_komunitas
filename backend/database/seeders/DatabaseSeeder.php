<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Thread;
use App\Models\Reply;
use App\Models\Like;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name'     => 'Admin Forum',
            'email'    => 'admin@forum.com',
            'password' => 'password123',
            'role'     => 'admin',
        ]);

        // Create Users
        $users = [];
        $userNames = [
            ['name' => 'Budi Santoso', 'email' => 'budi@forum.com'],
            ['name' => 'Siti Rahayu', 'email' => 'siti@forum.com'],
            ['name' => 'Ahmad Fauzi', 'email' => 'ahmad@forum.com'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@forum.com'],
            ['name' => 'Rizky Pratama', 'email' => 'rizky@forum.com'],
        ];

        foreach ($userNames as $userData) {
            $users[] = User::create([
                'name'     => $userData['name'],
                'email'    => $userData['email'],
                'password' => 'password123',
                'role'     => 'user',
            ]);
        }

        // Create Categories
        $categories = [];
        $categoryData = [
            ['name' => 'Pemrograman', 'description' => 'Diskusi seputar bahasa pemrograman dan teknologi'],
            ['name' => 'Web Development', 'description' => 'Diskusi tentang pengembangan web frontend dan backend'],
            ['name' => 'Mobile Development', 'description' => 'Diskusi tentang pengembangan aplikasi mobile'],
            ['name' => 'Database', 'description' => 'Diskusi tentang database dan manajemen data'],
            ['name' => 'DevOps', 'description' => 'Diskusi tentang deployment, CI/CD, dan infrastruktur'],
            ['name' => 'Umum', 'description' => 'Diskusi umum tentang teknologi dan karir IT'],
        ];

        foreach ($categoryData as $cat) {
            $categories[] = Category::create($cat);
        }

        // Create Threads
        $threadData = [
            [
                'title'   => 'Cara Belajar Laravel untuk Pemula',
                'content' => 'Halo semua! Saya baru mulai belajar Laravel. Bisa tolong share tips dan resource yang bagus untuk pemula? Saya sudah paham dasar PHP tapi belum pernah menggunakan framework. Terima kasih sebelumnya!',
                'user'    => $users[0],
                'cat'     => $categories[1],
            ],
            [
                'title'   => 'React vs Vue.js: Mana yang Lebih Baik untuk 2024?',
                'content' => 'Saya sedang mempertimbangkan framework frontend untuk project baru. Antara React dan Vue.js, mana yang lebih cocok untuk aplikasi skala menengah? Mohon share pengalaman dan pertimbangannya.',
                'user'    => $users[1],
                'cat'     => $categories[1],
            ],
            [
                'title'   => 'Best Practice Desain Database PostgreSQL',
                'content' => 'Saya ingin membahas tentang best practice dalam mendesain database PostgreSQL. Bagaimana pendapat kalian tentang penggunaan UUID vs Auto Increment? Dan bagaimana strategi indexing yang efisien?',
                'user'    => $users[2],
                'cat'     => $categories[3],
            ],
            [
                'title'   => 'Flutter vs React Native untuk Pemula',
                'content' => 'Bagi yang sudah berpengalaman di mobile development, mana yang lebih mudah dipelajari untuk pemula: Flutter atau React Native? Saya tertarik untuk membuat aplikasi cross-platform.',
                'user'    => $users[3],
                'cat'     => $categories[2],
            ],
            [
                'title'   => 'Tips Optimasi Query SQL yang Lambat',
                'content' => 'Saya memiliki query SQL yang sangat lambat ketika data sudah besar. Ada tips tentang cara mengoptimasi query dan penggunaan indexing? Khususnya untuk PostgreSQL.',
                'user'    => $users[4],
                'cat'     => $categories[3],
            ],
            [
                'title'   => 'Pengalaman Deploy Aplikasi ke AWS',
                'content' => 'Saya baru saja berhasil deploy aplikasi Laravel ke AWS EC2. Mau share pengalaman dan tips bagi yang ingin mencoba. Mulai dari setup server, install dependencies, hingga konfigurasi domain.',
                'user'    => $users[0],
                'cat'     => $categories[4],
            ],
            [
                'title'   => 'Bagaimana Memulai Karir di IT?',
                'content' => 'Saya mahasiswa semester akhir jurusan Informatika. Bagaimana cara memulai karir di IT? Apakah lebih baik langsung bekerja atau freelance dulu? Mohon share pengalaman dan sarannya.',
                'user'    => $users[1],
                'cat'     => $categories[5],
            ],
            [
                'title'   => 'Python untuk Data Science: Panduan Lengkap',
                'content' => 'Bagi yang tertarik Data Science, saya ingin share panduan belajar Python untuk data analysis. Mulai dari library dasar seperti Pandas, NumPy, hingga machine learning dengan Scikit-learn.',
                'user'    => $users[2],
                'cat'     => $categories[0],
            ],
        ];

        $threads = [];
        foreach ($threadData as $td) {
            $threads[] = Thread::create([
                'title'       => $td['title'],
                'content'     => $td['content'],
                'user_id'     => $td['user']->id,
                'category_id' => $td['cat']->id,
            ]);
        }

        // Create Replies
        $replyData = [
            ['thread' => 0, 'user' => 1, 'content' => 'Saya sarankan mulai dari dokumentasi resmi Laravel. Laracasts juga bagus untuk video tutorial. Semangat belajar!'],
            ['thread' => 0, 'user' => 2, 'content' => 'Coba ikuti project-based tutorial. Buat CRUD sederhana dulu, lalu tingkatkan pelan-pelan. Jangan lupa pelajari Eloquent ORM.'],
            ['thread' => 0, 'user' => 3, 'content' => 'Kalau sudah paham PHP, transisi ke Laravel harusnya smooth. Pelajari konsep MVC, routing, dan middleware terlebih dahulu.'],
            ['thread' => 1, 'user' => 0, 'content' => 'Menurut saya React lebih cocok karena ekosistemnya lebih besar dan banyak lowongan kerja. Tapi Vue lebih mudah dipelajari.'],
            ['thread' => 1, 'user' => 4, 'content' => 'Vue.js lebih cocok untuk project kecil-menengah karena learning curve-nya rendah. React untuk skala besar dan enterprise.'],
            ['thread' => 2, 'user' => 4, 'content' => 'UUID bagus untuk distributed system. Tapi perhatikan ukuran index-nya yang lebih besar dibanding integer.'],
            ['thread' => 2, 'user' => 0, 'content' => 'Untuk indexing, gunakan EXPLAIN ANALYZE untuk memahami query plan. Jangan over-indexing karena bisa memperlambat write operation.'],
            ['thread' => 3, 'user' => 2, 'content' => 'Flutter menurut saya lebih bagus sekarang. Hot reload-nya cepat dan widget system-nya sangat powerful.'],
            ['thread' => 4, 'user' => 2, 'content' => 'Coba gunakan EXPLAIN ANALYZE untuk melihat query plan. Biasanya masalahnya ada di missing index atau N+1 query.'],
            ['thread' => 5, 'user' => 3, 'content' => 'Terima kasih sharingnya! Apakah ada rekomendasi untuk CI/CD pipeline di AWS?'],
            ['thread' => 6, 'user' => 4, 'content' => 'Menurut saya bangun portfolio terlebih dahulu. Buat beberapa project yang bisa ditunjukkan ke recruiter.'],
            ['thread' => 7, 'user' => 1, 'content' => 'Jupyter Notebook sangat membantu untuk belajar. Bisa langsung lihat hasil di setiap cell.'],
        ];

        foreach ($replyData as $rd) {
            Reply::create([
                'content'   => $rd['content'],
                'user_id'   => $users[$rd['user']]->id,
                'thread_id' => $threads[$rd['thread']]->id,
            ]);
        }

        // Create Likes
        $allUsers = array_merge([$admin], $users);
        foreach ($threads as $index => $thread) {
            // Random likes from different users
            $likeCount = rand(1, count($allUsers));
            $shuffled = $allUsers;
            shuffle($shuffled);
            for ($i = 0; $i < $likeCount; $i++) {
                Like::create([
                    'user_id'   => $shuffled[$i]->id,
                    'thread_id' => $thread->id,
                ]);
            }
        }

        $this->command->info('Seeder berhasil dijalankan!');
        $this->command->info('Admin: admin@forum.com / password123');
        $this->command->info('User: budi@forum.com / password123');
    }
}
