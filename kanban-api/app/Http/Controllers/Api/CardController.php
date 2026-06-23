<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CardResource;
use App\Models\BoardList;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function index(Request $request)
    {
        $list = BoardList::findOrFail(request()->route('list')->id ?? request()->route('list'));

        $cards = Card::where('list_id', $list->id)
            ->with('tags')
            ->orderBy('order')
            ->get();

        return CardResource::collection($cards);
    }

    public function store(Request $request)
    {
        $list = BoardList::findOrFail(request()->route('list')->id ?? request()->route('list'));

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $order = Card::where('list_id', $list->id)->max('order') + 1;

        $card = Card::create(array_merge($validated, [
            'list_id' => $list->id,
            'order' => $order,
        ]));

        return new CardResource($card->load('tags'));
    }

    public function show($card)
    {
        $list = BoardList::findOrFail(request()->route('list')->id ?? request()->route('list'));

        $card = Card::where('list_id', $list->id)
            ->with('tags')
            ->findOrFail($card);

        return new CardResource($card);
    }

    public function update(Request $request, $card)
    {
        $list = BoardList::findOrFail(request()->route('list')->id ?? request()->route('list'));

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'order' => 'sometimes|required|integer|min:0',
            'due_date' => 'nullable|date',
        ]);

        $card = Card::where('list_id', $list->id)->findOrFail($card);
        $card->update($validated);

        return new CardResource($card->load('tags'));
    }

    public function destroy($card)
    {
        $list = BoardList::findOrFail(request()->route('list')->id ?? request()->route('list'));

        $card = Card::where('list_id', $list->id)->findOrFail($card);
        $card->delete();

        return response()->noContent();
    }

    public function move(Request $request, $card)
    {
        $validated = $request->validate([
            'list_id' => 'required|integer|exists:lists,id',
            'order' => 'required|integer|min:0',
        ]);

        $card = Card::findOrFail($card);
        $card->update($validated);

        return new CardResource($card->load('tags'));
    }

    public function attachTag(Request $request, $card, $tag)
    {
        $card = Card::findOrFail($card);
        $card->tags()->attach($tag);

        return new CardResource($card->load('tags'));
    }

    public function detachTag($card, $tag)
    {
        $card = Card::findOrFail($card);
        $card->tags()->detach($tag);

        return response()->noContent();
    }

    public function assignMember(Request $request, $card)
    {
        $validated = $request->validate([
            'member_id' => 'required|integer|exists:members,id',
        ]);

        $card = Card::findOrFail($card);

        // The task mentions assignMember endpoint, but schema lacks card_member pivot / assigned_to column.
        // Using the members table by member_id for now to avoid unknown schema violations.
        $card->members()->attach($validated['member_id']);

        return new CardResource($card->load('tags'));
    }

    public function unassignMember($card)
    {
        $validated = request()->validate([
            'member_id' => 'required|integer|exists:members,id',
        ]);

        $card = Card::findOrFail($card);
        $card->members()->detach($validated['member_id']);

        return response()->noContent();
    }
}
