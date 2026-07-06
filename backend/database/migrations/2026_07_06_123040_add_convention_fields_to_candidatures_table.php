<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidatures', function (Blueprint $table) {
            $table->string('convention_pdf_path')->nullable()->after('cv_file_snapshot');
            $table->string('yousign_procedure_id')->nullable()->after('convention_pdf_path');
            $table->string('yousign_signature_link_etudiant')->nullable()->after('yousign_procedure_id');
            $table->string('yousign_signature_link_entreprise')->nullable()->after('yousign_signature_link_etudiant');
            $table->enum('convention_statut', ['non_generee', 'generee', 'en_signature', 'signee'])->default('non_generee')->after('yousign_signature_link_entreprise');
            $table->timestamp('convention_signed_at')->nullable()->after('convention_statut');
        });
    }

    public function down(): void
    {
        Schema::table('candidatures', function (Blueprint $table) {
            $table->dropColumn([
                'convention_pdf_path',
                'yousign_procedure_id',
                'yousign_signature_link_etudiant',
                'yousign_signature_link_entreprise',
                'convention_statut',
                'convention_signed_at',
            ]);
        });
    }
};
