📄 CAHIER DES CHARGES : STAGECONNECT
1. Présentation Générale du Projet
Nom du projet : StageConnect (Plateforme de Gestion de Stages) Objectif : Créer un écosystème numérique moderne, sécurisé et en temps réel reliant les étudiants (chercheurs de stage) aux entreprises, avec un système de modération administratif complet. Stack Technologique :
Backend : Laravel 11 (API RESTful), base de données relationnelle (MySQL/PostgreSQL).
Frontend : Next.js 15+ (App Router, React), Tailwind CSS v4.
UI/UX : Shadcn UI, Aceternity UI, MagicUI, Framer Motion, Lucide Icons.
Temps Réel : Laravel Reverb (WebSockets).
Authentification : Laravel Sanctum (Token-based).
2. Les Acteurs du Système (Rôles)
Le système gère trois types d'utilisateurs distincts avec des permissions strictes gérées par des Middlewares (CheckRole, CheckBanned) :
L'Étudiant : Cherche un stage, gère son profil et postule aux offres.
L'Entreprise : Publie des offres, gère les candidatures et recrute.
L'Administrateur : Modère la plateforme, valide les comptes et analyse les statistiques.
3. Fonctionnalités Détaillées (Backlog par Acteur)
🎓 Espace Étudiant
Authentification : Inscription, connexion, déconnexion, changement de mot de passe.
Gestion de Profil :
Modification des informations de base (Nom, Bio, Filière, Niveau d'étude).
Gestion des expériences professionnelles (CRUD).
Sélection de compétences (Skills) depuis le référentiel global (Relation Many-to-Many).
Gestion des CVs (PDF) :
Upload sécurisé de CVs au format PDF.
Définition d'un "CV Principal".
Suppression (avec suppression physique du fichier sur le serveur).
Exploration des Offres :
Consulter les offres publiées et actives (appartenant à des entreprises non bloquées et validées).
Filtres de recherche (Mots-clés, Ville, Durée).
Candidatures :
Postuler à une offre avec lettre de motivation optionnelle (Sécurité anti-spam : postulation unique par offre).
Mécanisme de Snapshot : Création d'une copie physique du CV au moment de la candidature pour garantir sa disponibilité même si l'étudiant supprime son CV ultérieurement.
Suivi du statut (En attente, Accepté, Refusé) et possibilité d'annuler sa candidature.
Messagerie :
Discuter en temps réel avec les entreprises l'ayant contacté.
🏢 Espace Entreprise
Authentification : Inscription (nécessite la validation de l'Admin pour être active), connexion.
Gestion de Profil : Mise à jour de la description et du site web de l'entreprise.
Gestion des Offres de Stage :
Créer, modifier, supprimer des offres (Titre, description, dates, durée, localisation, statut).
Soft Deletes activé : Les offres supprimées restent visibles dans l'historique des étudiants ayant postulé (Intégrité référentielle via withTrashed()).
Gestion des Candidatures :
Visualiser les candidats par offre spécifique.
Télécharger le CV (Snapshot PDF) de l'étudiant.
Accepter ou Refuser une candidature (Action unique, impossible de modifier après décision).
Envoi automatique d'emails de notification aux étudiants lors d'un changement de statut.
Messagerie :
Initier une nouvelle conversation avec un candidat (Logique anti-doublon pour éviter les multiples instances de chat).
👑 Espace Administrateur
Dashboard & Statistiques : Visualisation des KPIs (Total utilisateurs, offres publiées, candidatures acceptées, etc.).
Modération des Utilisateurs :
Lister tous les étudiants et entreprises.
Bloquer / Débloquer un utilisateur (is_blocked). Si bloqué, ses tokens sont détruits instantanément.
Validation des Entreprises : Approuver (est_valide = true) ou Rejeter (suppression) les nouveaux comptes entreprises.
Référentiel des Compétences : Gérer la table des "Skills" (Ajouter/Supprimer) pour uniformiser les choix des étudiants.
Supervision globale : Accès en lecture à toutes les offres de la plateforme.
4. Spécifications Techniques et Logique Métier (Backend)
Transactions Base de Données (DB::transaction) : Utilisées pour les opérations critiques combinées (ex: Créer une candidature + copier le fichier PDF, ou Créer une conversation + lier les utilisateurs) pour éviter les incohérences en cas d'erreur serveur.
Sécurité et Anti-Spam :
Rate Limiting sur l'API Login (blocage après 5 tentatives échouées).
Throttle sur l'envoi de messages WebSockets (max 30 messages/minute).
Messagerie en Temps Réel (WebSockets) :
Canaux privés (PrivateChannel) sécurisés (vérification d'appartenance à la conversation).
Événements diffusés : MessageSent, MessageUpdated, MessageDeleted, MessageRead.
Un utilisateur ne peut modifier ou supprimer que ses propres messages, et uniquement s'ils n'ont pas encore été lus (is_read == false).
5. Exigences UI/UX (Frontend 2026)
Architecture Split-Screen : Utilisation de mises en page modernes pour l'authentification (Grid design d'un côté, formulaire épuré de l'autre).
Esthétique Lumineuse : Palette de couleurs basée sur le Blanc Perle, Slate clair et un Indigo/Bleu vibrant. Rejet total des couleurs sombres/ternes pour privilégier un aspect professionnel SaaS.
Micro-interactions et Animations : * Glassmorphism (effets de flou et transparence sur les cartes).
Intégration de patterns culturels subtils (Zellige minimaliste à 2% d'opacité).
Animations hautes performances via Canvas (Vortex, particules, météores intra-cartes) ciblées uniquement sur les landing pages pour l'effet "Wow" sans surcharger le tableau de bord.
Composants Standardisés : Utilisation de Shadcn UI pour garantir une cohérence visuelle sur les inputs, boutons, tables et modales. Remplacement de l'ancien système de "Toast" par Sonner pour des alertes plus esthétiques et dynamiques.
6. Architecture de la Base de Données (Mapping MCD)
Les entités principales et leurs relations :
User (STI - Single Table Inheritance avec la colonne role).
Skill (Lié en Many-to-Many avec User via skill_user).
Experience (Lié en One-to-Many avec User).
Cv (Lié en One-to-Many avec User).
OffreStage (Lié en One-to-Many avec User rôle Entreprise).
Candidature (Table de liaison avec attributs entre User, OffreStage et Cv).
Conversation et Message (Liés en Many-to-Many avec User via conversation_user).

