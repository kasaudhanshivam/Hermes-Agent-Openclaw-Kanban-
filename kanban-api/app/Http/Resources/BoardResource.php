<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BoardResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'created_by' => $this->resource->created_by,
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
            'lists' => BoardListResource::collection($this->whenLoaded('lists')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'members' => MemberResource::collection($this->whenLoaded('members')),
        ];
    }
}
