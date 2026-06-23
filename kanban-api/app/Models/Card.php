<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = ['list_id', 'title', 'description', 'order', 'due_date', 'created_by'];

    public function list()
    {
        return $this->belongsTo(BoardList::class, 'list_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'card_tag');
    }

    public function members()
    {
        return $this->belongsToMany(Member::class, 'card_member');
    }
}
