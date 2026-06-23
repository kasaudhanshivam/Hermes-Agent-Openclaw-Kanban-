<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CardResource;
use App\Models\Board;
use App\Models\BoardList;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index(Request $request, $board, $list)
    {
        $listModel = BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list);

        $cards = Card::where('list_id', $listModel->id)
            ->with('tags')
            ->orderBy('order')
            ->get();

        return CardResource::collection($cards);
    }

    public function store(Request $request, $board, $list)
    {
        $listModel = BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $order = Card::where('list_id', $listModel->id)->max('order') + 1;

        $card = Card::create(array_merge($validated, [
            'list_id' => $listModel->id,
            'order' => $order,
        ]));

        return new CardResource($card->load('tags'));
    }

    public function show(Request $request, $board, $list, $card)
    {
        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)
            ->with('tags')
            ->findOrFail($card);

        return new CardResource($card);
    }

    public function update(Request $request, $board, $list, $card)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'sometimes|required|integer|min:0',
            'due_date' => 'nullable|date',
        ]);

        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)->findOrFail($card);
        $card->update($validated);

        return new CardResource($card->load('tags'));
    }

    public function destroy(Request $request, $board, $list, $card)
    {
        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)->findOrFail($card);
        $card->delete();

        return response()->noContent();
    }

    public function move(Request $request, $board, $list, $card)
    {
        $validated = $request->validate([
            'list_id' => 'required|integer|exists:lists,id',
            'order' => 'required|integer|min:0',
        ]);

        $card = Card::findOrFail($card);
        $card->update($validated);

        return new CardResource($card->load('tags'));
    }

    public function attachTag(Request $request, $board, $list, $card, $tag)
    {
        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)->findOrFail($card);
        $card->tags()->attach($tag);

        return new CardResource($card->load('tags'));
    }

    public function detachTag(Request $request, $board, $list, $card, $tag)
    {
        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)->findOrFail($card);
        $card->tags()->detach($tag);

        return response()->noContent();
    }

    public function assignMember(Request $request, $board, $list, $card)
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:members,id',
        ]);

        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)->findOrFail($card);

        $card->members()->attach($validated['member_id']);

        return new CardResource($card->load('tags'));
    }

    public function unassignMember(Request $request, $board, $list, $card)
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:members,id',
        ]);

        $card = Card::where('list_id', BoardList::where('board_id', Board::findOrFail($board)->id)->findOrFail($list)->id)->findOrFail($card);
        $card->members()->detach($validated['member_id']);

        return response()->noContent();
    }
}
