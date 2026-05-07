<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CategoryRequestController;
use App\Http\Controllers\Api\ThreadController;
use App\Http\Controllers\Api\ReplyController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::get('/check-reset-token', [PasswordResetController::class, 'checkToken']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Public read-only
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/threads', [ThreadController::class, 'index']);
Route::get('/threads/{thread}', [ThreadController::class, 'show']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profile Management
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [AuthController::class, 'removeAvatar']);

    // Categories (admin only for CUD)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Threads
    Route::post('/threads', [ThreadController::class, 'store']);
    Route::put('/threads/{thread}', [ThreadController::class, 'update']);
    Route::put('/threads/{thread}/status', [ThreadController::class, 'updateStatus']);
    Route::delete('/threads/{thread}', [ThreadController::class, 'destroy']);

    // Likes
    Route::post('/threads/{thread}/like', [ThreadController::class, 'toggleLike']);

    // Replies
    Route::post('/replies', [ReplyController::class, 'store']);
    Route::put('/replies/{reply}', [ReplyController::class, 'update']);
    Route::delete('/replies/{reply}', [ReplyController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Category Requests
    Route::get('/category-requests', [CategoryRequestController::class, 'index']);
    Route::post('/category-requests', [CategoryRequestController::class, 'store']);
    Route::post('/category-requests/{id}/approve', [CategoryRequestController::class, 'approve']);
    Route::post('/category-requests/{id}/reject', [CategoryRequestController::class, 'reject']);
});
