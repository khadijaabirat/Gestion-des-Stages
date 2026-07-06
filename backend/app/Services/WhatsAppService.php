<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected ?Client $client = null;
    protected string $from;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->from = config('services.twilio.whatsapp_from', 'whatsapp:+14155238886');

        if ($sid && $token) {
            $this->client = new Client($sid, $token);
        }
    }

    /**
     * Envoyer un message WhatsApp à un numéro de téléphone.
     */
    public function sendMessage(string $to, string $body): bool
    {
        if (!$this->client) {
            Log::warning('WhatsApp: Twilio non configuré (SID/Token manquants).');
            return false;
        }

        // Nettoyer et formater le numéro
        $to = $this->formatPhoneNumber($to);
        if (!$to) {
            Log::warning('WhatsApp: Numéro de téléphone invalide.');
            return false;
        }

        try {
            $this->client->messages->create(
                "whatsapp:{$to}",
                [
                    'from' => $this->from,
                    'body' => $body,
                ]
            );
            Log::info("WhatsApp envoyé à {$to}");
            return true;
        } catch (\Exception $e) {
            Log::error("WhatsApp erreur: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notification: Candidature acceptée → Étudiant
     */
    public function notifyCandidatureAccepted(string $phone, string $studentName, string $offerTitle, string $companyName): bool
    {
        $body = "🎉 *Félicitations {$studentName} !*\n\n"
            . "Votre candidature pour le stage *\"{$offerTitle}\"* chez *{$companyName}* a été *acceptée* !\n\n"
            . "L'entreprise va vous contacter très prochainement pour fixer les détails du stage.\n\n"
            . "Bonne chance ! 🚀\n"
            . "— _NexusIntern_";

        return $this->sendMessage($phone, $body);
    }

    /**
     * Notification: Candidature refusée → Étudiant
     */
    public function notifyCandidatureRefused(string $phone, string $studentName, string $offerTitle, string $companyName): bool
    {
        $body = "📋 *Bonjour {$studentName},*\n\n"
            . "Nous vous remercions pour l'intérêt que vous avez porté à l'offre *\"{$offerTitle}\"* chez *{$companyName}*.\n\n"
            . "Malheureusement, votre candidature n'a pas été retenue pour ce poste.\n\n"
            . "Ne vous découragez pas, d'autres opportunités vous attendent sur la plateforme ! 💪\n"
            . "— _NexusIntern_";

        return $this->sendMessage($phone, $body);
    }

    /**
     * Notification: Nouvelle candidature reçue → Entreprise
     */
    public function notifyNewCandidature(string $phone, string $companyName, string $studentName, string $offerTitle): bool
    {
        $body = "📩 *Nouvelle candidature reçue !*\n\n"
            . "Bonjour *{$companyName}*,\n\n"
            . "L'étudiant *{$studentName}* a postulé à votre offre *\"{$offerTitle}\"*.\n\n"
            . "Connectez-vous à NexusIntern pour consulter son profil et son CV.\n"
            . "— _NexusIntern_";

        return $this->sendMessage($phone, $body);
    }

    /**
     * Notification: Compte entreprise validé par l'admin
     */
    public function notifyAccountValidated(string $phone, string $companyName): bool
    {
        $body = "✅ *Bonne nouvelle {$companyName} !*\n\n"
            . "Votre compte entreprise sur *NexusIntern* a été validé par l'administration.\n\n"
            . "Vous pouvez maintenant publier des offres de stage et recruter des talents ! 🚀\n"
            . "— _NexusIntern_";

        return $this->sendMessage($phone, $body);
    }

    /**
     * Formater le numéro de téléphone au format international.
     */
    protected function formatPhoneNumber(string $phone): ?string
    {
        // Supprimer les espaces, tirets, parenthèses
        $phone = preg_replace('/[\s\-\(\)]+/', '', $phone);

        // Format marocain: 06/07xxxxxxxx → +212xxxxxxxx
        if (preg_match('/^0([67]\d{8})$/', $phone, $matches)) {
            return '+212' . $matches[1];
        }

        // Déjà au format international +212...
        if (preg_match('/^\+212\d{9}$/', $phone)) {
            return $phone;
        }

        // Format international quelconque
        if (preg_match('/^\+\d{10,15}$/', $phone)) {
            return $phone;
        }

        return null;
    }
}
