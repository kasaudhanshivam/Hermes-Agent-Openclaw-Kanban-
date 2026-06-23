<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->change();
            $table->dropForeign(['created_by']);
        });

        Schema::table('cards', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->change();
            $table->dropForeign(['created_by']);
        });
    }

    public function down(): void
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable(false)->change();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('cards', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable(false)->change();
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
