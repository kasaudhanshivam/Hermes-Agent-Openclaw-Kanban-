<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardListController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TagController;

Route::get('/setup-db', function () {
    $path = database_path('database.sqlite');
    File::ensureDirectoryExists(database_path(''));
    file_put_contents($path, '');
    Artisan::call('migrate', ['--force' => true]);

    return response()->json(['status' => 'Database setup complete']);
});

Route::prefix('v1')->group(function () {
    Route::apiResource('boards', BoardController::class);
    Route::prefix('boards/{board}')->group(function () {
        Route::apiResource('lists', BoardListController::class)
            ->scoped(['list' => 'list']);
        Route::apiResource('tags', TagController::class)
            ->scoped(['tag' => 'tag']);
        Route::apiResource('members', MemberController::class)
            ->scoped(['member' => 'member']);
        Route::prefix('lists/{list}')->group(function () {
            Route::apiResource('cards', CardController::class)
                ->scoped(['card' => 'card'])
                ->except(['index']);
            Route::put('cards/{card}/move', [CardController::class, 'move']);
        });
        Route::prefix('cards/{card}')->group(function () {
            Route::post('tags/{tag}', [CardController::class, 'attachTag']);
            Route::delete('tags/{tag}', [CardController::class, 'detachTag']);
            Route::put('assign', [CardController::class, 'assignMember']);
            Route::delete('assign', [CardController::class, 'unassignMember']);
        });
    });
});
