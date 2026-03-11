<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255|unique:categories,name,' . $this->route('category'),
            'description' => 'nullable|string|max:1000',
        ];
    }
}
