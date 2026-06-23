<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index(Request $request, $boardId)
    {
        $tags = Tag::where('board_id', $boardId)->get();

        return TagResource::collection($tags);
    }

    public function store(Request $request, $boardId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $tag = Tag::create($validated + ['board_id' => $boardId]);

        return new TagResource($tag);
    }

    public function show($boardId, $tag)
    {
        $tag = Tag::where('board_id', $boardId)->findOrFail($tag);

        return new TagResource($tag);
    }

    public function update(Request $request, $boardId, $tag)
    {
        $tag = Tag::where('board_id', $boardId)->findOrFail($tag);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $tag->update($validated);

        return new TagResource($tag);
    }

    public function destroy($boardId, $tag)
    {
        $tag = Tag::where('board_id', $boardId)->findOrFail($tag);
        $tag->delete();

        return response()->noContent();
    }
}
