<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreThreadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'category_id' => 'required|uuid|exists:categories,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Judul thread wajib diisi.',
            'content.required'     => 'Konten thread wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak ditemukan.',
        ];
    }
}
