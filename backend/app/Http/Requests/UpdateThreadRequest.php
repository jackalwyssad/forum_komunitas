<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateThreadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => 'sometimes|required|string|max:255',
            'content'     => 'sometimes|required|string',
            'category_id' => 'sometimes|required|uuid|exists:categories,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Judul thread wajib diisi.',
            'content.required'     => 'Konten thread wajib diisi.',
            'category_id.exists'   => 'Kategori tidak ditemukan.',
        ];
    }
}
