<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'board_id' => $this->resource->board_id,
            'user_id' => $this->resource->user_id,
            'role' => $this->resource->role,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->resource->user->id,
                    'name' => $this->resource->user->name,
                    'email' => $this->resource->user->email,
                ];
            }),
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
        ];
    }
}
