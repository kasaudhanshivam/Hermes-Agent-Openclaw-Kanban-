<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BoardListResource;
use App\Models\Board;
use App\Models\BoardList;
use Illuminate\Http\Request;

class BoardListController extends Controller
{
    public function index(Request $request, $board)
    {
        $board = Board::findOrFail($board);

        $lists = BoardList::where('board_id', $board->id)
            ->with('cards.tags', 'cards')
            ->orderBy('order')
            ->get();

        return BoardListResource::collection($lists);
    }

    public function store(Request $request, $board)
    {
        $board = Board::findOrFail($board);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $list = BoardList::create(array_merge($validated, [
            'board_id' => $board->id,
            'order' => 0,
        ]));

        return new BoardListResource($list->load('cards.tags', 'cards'));
    }

    public function show(Request $request, $board, $list)
    {
        $list = BoardList::where('board_id', Board::findOrFail($board)->id)
            ->with('cards.tags', 'cards')
            ->findOrFail($list);

        return new BoardListResource($list);
    }

    public function update(Request $request, $board, $list)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'order' => 'sometimes|required|integer|min:0',
        ]);

        $list = BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list);
        $list->update($validated);

        return new BoardListResource($list->load('cards.tags', 'cards'));
    }

    public function destroy(Request $request, $board, $list)
    {
        $list = BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list);
        $list->delete();

        return response()->noContent();
    }
}
