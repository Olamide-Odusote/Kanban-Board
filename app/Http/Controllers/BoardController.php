<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Task;
use App\Rules\UniqueToBoard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BoardController extends Controller
{
    protected Board $board;

    public function __construct()
    {
        $this->board = Board::where(
            'user_id',
            Auth::id()
        )->firstOrFail();
    }

    public function show() {
        $board = $this->board;

        if ($board->tasks != null) {
            $tasks = $board->tasks;

            $todo = $tasks->where('status', 'todo')->sortBy('position');
            $doing = $tasks->where('status', 'doing')->sortBy('position');
            $done = $tasks->where('status', 'done')->sortBy('position');
        }
        else {
            $tasks = $todo = $doing = $done = [];
        }

        Log::info('Board loaded', ['ID' => $board->id]);

        return view('board', compact('board', 'tasks', 'todo', 'doing', 'done'));
    }

    public function addTask(Request $request) {        
        $validated = $request->validate([
            'name' => ['required', 'string', new UniqueToBoard],
            'status' => ['required', 'string'],
            'position' => ['required', 'int']
        ]);
        
        $task = Task::create([
            'name' => $validated['name'],
            'status' => $validated['status'],
            'position' => $validated['position'],
            'board_id' => $this->board->id
        ]);


        Log::info('Tasks', $this->board->tasks->toArray());
        return response()->json(['task' => $task], 201);
    }

    public function deleteTask(Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string']
        ]);

        $task = Task::where('name', $validated['name']) 
                    ->where('board_id', $this->board->id)
                    ->firstOrFail();
        
        $task->delete();
        $task->save();
        return response()->json(['task' => $task], 201);
    }

    public function changeTaskName(Request $request) {
        $validated = $request->validate([
            'old_name' => ['required', 'string'],
            'new_name' => ['required', 'string']
        ]);

        $task = Task::where('name', $validated['old_name']) 
                    ->where('board_id', $this->board->id)
                    ->firstOrFail();
        
        $task->name = $validated['new_name'];
        $task->save();
        return response()->json(['task' => $task], 201);
    }

    public function moveTask(Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string'], 
            'status' => ['required', 'string'],
            'position' => ['required', 'int']
        ]);

        $task = Task::where('name', $validated['name']) 
                    ->where('board_id', $this->board->id)
                    ->firstOrFail();
        
        $task->status = $validated['status'];
        $task->position = $validated['position'];
        $task->save();
        return response()->json(['task' => $task], 201);
    }

}
