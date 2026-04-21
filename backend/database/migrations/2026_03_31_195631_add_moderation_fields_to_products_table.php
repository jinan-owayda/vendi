<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->enum('moderation_status', ['pending', 'approved', 'flagged', 'rejected'])
                  ->default('pending')
                  ->after('status');

            $table->text('moderation_reason')->nullable()->after('moderation_status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['moderation_status', 'moderation_reason']);
        });
    }
};