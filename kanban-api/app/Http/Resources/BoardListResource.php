<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BoardListResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'board_id' => $this->resource->board_id,
            'title' => $this->resource->title,
            'order' => $this->resource->order,
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
            'cards' => CardResource::collection($this->whenLoaded('cards')),
        ];
    }
}
