<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('threads')->orderBy('name')->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Store a newly created category (admin only).
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return response()->json([
            'message' => 'Kategori berhasil dibuat.',
            'data'    => new CategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(string $id): JsonResponse
    {
        $category = Category::withCount('threads')->findOrFail($id);

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Update the specified category (admin only).
     */
    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());

        return response()->json([
            'message' => 'Kategori berhasil diupdate.',
            'data'    => new CategoryResource($category),
        ]);
    }

    /**
     * Remove the specified category (admin only).
     */
    public function destroy(string $id): JsonResponse
    {
        $user = request()->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
