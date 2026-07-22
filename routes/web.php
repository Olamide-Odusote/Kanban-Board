<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth')->group(function () {
    Route::get('/', [BoardController::class, 'show'])->name('board');
    Route::post('/addTask', [BoardController::class, 'addTask']);
    Route::post('/moveTask', [BoardController::class, 'moveTask'])->name('moveTask');

    Route::post('/logout', [AuthController::class, 'logout']);
});


Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::get('/login', [AuthController::class, 'showLogin']);

    Route::post('/register', [AuthController::class, 'register'])->name('register'); 
    Route::get('/register', [AuthController::class, 'showRegister']);
});