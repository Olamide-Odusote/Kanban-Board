<?php

namespace App\Rules;

use App\Models\Board;
use App\Models\Task;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Translation\PotentiallyTranslatedString;

class UniqueToBoard implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $board = Board::where('user_id', Auth::id())->firstOrFail();

        $taskExists = Task::where('name', $value)
                  ->where('board_id', $board->id)
                  ->exists();

        if ($taskExists) {
            $fail('A task with this name already exists');
        }
    }
}
