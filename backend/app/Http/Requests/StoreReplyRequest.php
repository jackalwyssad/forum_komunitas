<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'   => 'required|string',
            'thread_id' => 'required|uuid|exists:threads,id',
            'parent_id' => 'nullable|uuid|exists:replies,id',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required'   => 'Konten reply wajib diisi.',
            'thread_id.required' => 'Thread ID wajib diisi.',
            'thread_id.exists'   => 'Thread tidak ditemukan.',
        ];
    }
}
