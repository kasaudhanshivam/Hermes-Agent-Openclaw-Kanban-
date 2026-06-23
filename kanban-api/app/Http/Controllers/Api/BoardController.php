<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BoardResource;
use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        $boards = Board::with('lists', 'tags', 'members')->get();

        return BoardResource::collection($boards);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $board = Board::create($validated + ['created_by' => 1]);

        return new BoardResource($board->load('lists', 'tags', 'members'));
    }

    public function show($board)
    {
        $board = Board::with('lists.cards.tags', 'lists.cards', 'tags', 'members')->findOrFail($board);

        return new BoardResource($board);
    }

    public function update(Request $request, $board)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
        ]);

        $board = Board::findOrFail($board);
        $board->update($validated);

        return new BoardResource($board->load('lists', 'tags', 'members'));
    }

    public function destroy($board)
    {
        $board = Board::findOrFail($board);
        $board->delete();

        return response()->noContent();
    }
}
