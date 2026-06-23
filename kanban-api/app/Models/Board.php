<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Board extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'created_by'];

    public function lists()
    {
        return $this->hasMany(BoardList::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }

    public function members()
    {
        return $this->hasMany(Member::class);
    }
}
