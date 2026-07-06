<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidatures', function (Blueprint $table) {
            $table->text('yousign_signature_link_etudiant')->nullable()->change();
            $table->text('yousign_signature_link_entreprise')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('candidatures', function (Blueprint $table) {
            $table->string('yousign_signature_link_etudiant')->nullable()->change();
            $table->string('yousign_signature_link_entreprise')->nullable()->change();
        });
    }
};
