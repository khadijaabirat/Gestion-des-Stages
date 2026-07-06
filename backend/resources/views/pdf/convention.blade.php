<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 0; }
    .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; color: #1e40af; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 2px; }
    .header p { margin: 0; color: #6b7280; font-size: 11px; }
    .ref { text-align: right; font-size: 10px; color: #9ca3af; margin-bottom: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: bold; color: #1e40af; border-left: 4px solid #1e40af; padding-left: 8px; margin-bottom: 10px; text-transform: uppercase; }
    table.info { width: 100%; border-collapse: collapse; }
    table.info td { padding: 5px 8px; font-size: 11px; }
    table.info td:first-child { font-weight: bold; width: 40%; color: #374151; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 8px 0; }
    .article { margin-bottom: 14px; }
    .article-title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
    .article-body { font-size: 11px; line-height: 1.6; color: #374151; }
    .signatures { margin-top: 40px; }
    .sig-grid { width: 100%; }
    .sig-grid td { width: 33%; vertical-align: top; padding: 0 10px; text-align: center; }
    .sig-box { border: 1px dashed #9ca3af; height: 70px; margin: 8px 0; }
    .sig-label { font-size: 10px; font-weight: bold; color: #374151; }
    .sig-name { font-size: 10px; color: #6b7280; margin-top: 4px; }
    .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; font-size: 10px; font-weight: bold; }
</style>
</head>
<body>

<div class="header">
    <h1>Convention de Stage</h1>
    <p>NexusIntern Platform &mdash; Gestion des Stages Professionnels</p>
</div>

<div class="ref">
    Réf. : CONV-{{ str_pad($candidature->id, 6, '0', STR_PAD_LEFT) }} &nbsp;|&nbsp;
    Générée le : {{ now()->format('d/m/Y à H:i') }}
</div>

<div class="section">
    <div class="section-title">Parties Concernées</div>
    <table class="info">
        <tr><td>Étudiant(e) :</td><td>{{ $etudiant->nom }}</td></tr>
        <tr><td>Email étudiant :</td><td>{{ $etudiant->email }}</td></tr>
        @if($etudiant->filiere)
        <tr><td>Filière :</td><td>{{ $etudiant->filiere }}@if($etudiant->niveau_etude) — {{ $etudiant->niveau_etude }}@endif</td></tr>
        @endif
        <tr><td colspan="2"><hr class="divider"></td></tr>
        <tr><td>Entreprise d'accueil :</td><td>{{ $entreprise->nom }}</td></tr>
        <tr><td>Email entreprise :</td><td>{{ $entreprise->email }}</td></tr>
        @if($entreprise->adresse)
        <tr><td>Adresse :</td><td>{{ $entreprise->adresse }}</td></tr>
        @endif
    </table>
</div>

<div class="section">
    <div class="section-title">Détails du Stage</div>
    <table class="info">
        <tr><td>Intitulé du poste :</td><td><strong>{{ $offre->titre }}</strong></td></tr>
        @if($offre->lieu)
        <tr><td>Lieu :</td><td>{{ $offre->lieu }}</td></tr>
        @endif
        @if($offre->date_debut)
        <tr><td>Date de début :</td><td>{{ \Carbon\Carbon::parse($offre->date_debut)->format('d/m/Y') }}</td></tr>
        @endif
        @if($offre->date_fin)
        <tr><td>Date de fin :</td><td>{{ \Carbon\Carbon::parse($offre->date_fin)->format('d/m/Y') }}</td></tr>
        @endif
        @if($offre->remuneration)
        <tr><td>Rémunération :</td><td>{{ number_format($offre->remuneration, 2) }} MAD / mois</td></tr>
        @endif
        <tr><td>Statut candidature :</td><td><span class="badge">Acceptée</span></td></tr>
    </table>
</div>

<div class="section">
    <div class="section-title">Articles de la Convention</div>

    <div class="article">
        <div class="article-title">Article 1 — Objet</div>
        <div class="article-body">
            La présente convention a pour objet de définir les conditions dans lesquelles
            <strong>{{ $etudiant->nom }}</strong> effectuera un stage au sein de l'entreprise
            <strong>{{ $entreprise->nom }}</strong> pour le poste de <strong>{{ $offre->titre }}</strong>.
        </div>
    </div>

    <div class="article">
        <div class="article-title">Article 2 — Durée et Horaires</div>
        <div class="article-body">
            Le stage se déroulera selon les dates définies ci-dessus. L'étudiant(e) respectera
            les horaires de travail en vigueur dans l'entreprise d'accueil.
        </div>
    </div>

    <div class="article">
        <div class="article-title">Article 3 — Obligations de l'Entreprise</div>
        <div class="article-body">
            L'entreprise s'engage à accueillir le/la stagiaire dans de bonnes conditions,
            à lui confier des missions en rapport avec sa formation, à désigner un tuteur
            responsable de son encadrement, et à lui fournir les moyens nécessaires.
        </div>
    </div>

    <div class="article">
        <div class="article-title">Article 4 — Obligations du Stagiaire</div>
        <div class="article-body">
            Le/la stagiaire s'engage à respecter le règlement intérieur de l'entreprise,
            à observer la confidentialité des informations auxquelles il/elle aura accès,
            et à accomplir avec sérieux les missions qui lui seront confiées.
        </div>
    </div>

    <div class="article">
        <div class="article-title">Article 5 — Confidentialité</div>
        <div class="article-body">
            Le/la stagiaire s'engage à ne divulguer aucune information confidentielle
            relative à l'entreprise, ses clients, ses procédés ou ses projets, pendant
            et après la durée du stage.
        </div>
    </div>
</div>

<div class="signatures">
    <div class="section-title">Signatures des Parties</div>
    <table class="sig-grid">
        <tr>
            <td>
                <div class="sig-label">L'Étudiant(e)</div>
                <div class="sig-box"></div>
                <div class="sig-name">{{ $etudiant->nom }}</div>
                <div class="sig-name">Date : ___________</div>
            </td>
            <td>
                <div class="sig-label">L'Entreprise</div>
                <div class="sig-box"></div>
                <div class="sig-name">{{ $entreprise->nom }}</div>
                <div class="sig-name">Date : ___________</div>
            </td>
            <td>
                <div class="sig-label">Cachet &amp; Visa</div>
                <div class="sig-box"></div>
                <div class="sig-name">Représentant légal</div>
                <div class="sig-name">Date : ___________</div>
            </td>
        </tr>
    </table>
</div>

<div class="footer">
    Document généré automatiquement par NexusIntern Platform &mdash; {{ config('app.url') }}<br>
    Ce document a valeur contractuelle une fois signé par toutes les parties.
</div>

</body>
</html>
