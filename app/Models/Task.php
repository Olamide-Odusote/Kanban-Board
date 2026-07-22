<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        "id",
        "name",
        "status",
        "position",
        "board_id"
    ];

    public function board() {
        return $this->belongsTo(Board::class);
    }
}
