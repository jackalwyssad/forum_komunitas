<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'message' => 'Validasi gagal.',
                    'errors'  => $exception->errors(),
                ], 422);
            }

            if ($exception instanceof ModelNotFoundException || $exception instanceof NotFoundHttpException) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                ], 404);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'message' => 'Unauthenticated. Silakan login terlebih dahulu.',
                ], 401);
            }

            if ($exception instanceof MethodNotAllowedHttpException) {
                return response()->json([
                    'message' => 'Method tidak diizinkan.',
                ], 405);
            }

            return response()->json([
                'message' => 'Terjadi kesalahan server.',
                'error'   => config('app.debug') ? $exception->getMessage() : 'Internal Server Error',
            ], 500);
        }

        return parent::render($request, $exception);
    }
}
