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
            'title'       => 'required|string|min:10|max:255',
            'content'     => 'required|string|min:30',
            'category_id' => 'required|uuid|exists:categories,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Judul thread wajib diisi.',
            'title.min'            => 'Judul thread minimal 10 karakter.',
            'title.max'            => 'Judul thread maksimal 255 karakter.',
            'content.required'     => 'Konten thread wajib diisi.',
            'content.min'          => 'Konten thread minimal 30 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak ditemukan.',
        ];
    }
}
