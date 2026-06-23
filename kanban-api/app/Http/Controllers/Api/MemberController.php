<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request, $boardId)
    {
        $members = Member::where('board_id', $boardId)
            ->with('user')
            ->get();

        return MemberResource::collection($members);
    }

    public function store(Request $request, $boardId)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'nullable|string|max:255',
        ]);

        $member = Member::create($validated + ['board_id' => $boardId]);

        return new MemberResource($member->load('user'));
    }

    public function show($boardId, $member)
    {
        $member = Member::where('board_id', $boardId)
            ->with('user')
            ->findOrFail($member);

        return new MemberResource($member);
    }

    public function update(Request $request, $boardId, $member)
    {
        $member = Member::where('board_id', $boardId)->findOrFail($member);

        $validated = $request->validate([
            'role' => 'sometimes|required|string|max:255',
        ]);

        $member->update($validated);

        return new MemberResource($member->load('user'));
    }

    public function destroy($boardId, $member)
    {
        $member = Member::where('board_id', $boardId)->findOrFail($member);
        $member->delete();

        return response()->noContent();
    }
}
