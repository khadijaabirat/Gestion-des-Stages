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
        Schema::create('candidatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('offre_stage_id')->constrained('offre_stages') ;
            $table->foreignId('cv_id')->nullable()->constrained()->nullOnDelete(); 
            $table->text('lettre_motivation')->nullable(); 
            $table->enum('statut', ['en_attente', 'accepte', 'refuse', 'annule'])->default('en_attente');   
             $table->string('cv_file_snapshot');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidatures');
    }
};
