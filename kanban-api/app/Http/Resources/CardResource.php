<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CardResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'list_id' => $this->resource->list_id,
            'title' => $this->resource->title,
            'description' => $this->resource->description,
            'order' => $this->resource->order,
            'due_date' => $this->resource->due_date,
            'created_by' => $this->resource->created_by,
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
