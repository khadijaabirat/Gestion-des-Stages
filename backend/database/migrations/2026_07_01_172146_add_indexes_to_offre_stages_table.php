<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('offre_stages', function (Blueprint $table) {
            // Index FullText combiné pour accélérer les recherches complexes (LIKE %...%)
            $table->fullText(['titre', 'description'], 'offres_search_index');
            
            // Note: Si vous utilisez une très vieille BDD qui ne supporte pas fullText, 
            // utilisez plutôt : $table->index('titre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offre_stages', function (Blueprint $table) {
            $table->dropIndex('offres_search_index');
        });
    }
};
