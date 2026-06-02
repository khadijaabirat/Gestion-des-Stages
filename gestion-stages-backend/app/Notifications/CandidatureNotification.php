<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Candidature;

class CandidatureNotification extends Notification
{
    use Queueable;
    protected $candidature;
    protected $typeAction;
    /**
     * Create a new notification instance.
     */
    public function __construct($candidature,$typeAction)
    {
       $this->candidature = $candidature;
        $this->typeAction = $typeAction;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = new MailMessage;

        if ($this->typeAction === 'creation') {
            return $mail->subject('Nouvelle Candidature Reçue - StageConnect')
                ->greeting('Bonjour ' . $this->candidature->offreStage->entreprise->nom . ',')
                ->line("L'étudiant " . $this->candidature->etudiant->nom . " a postulé à votre offre de stage : " . $this->candidature->offreStage->titre)
                ->line("Filière de l'étudiant : " . $this->candidature->etudiant->filiere)
                ->action('Voir la candidature', url('/api/candidatures/' . $this->candidature->id))
                ->line('Merci d\'utiliser notre plateforme pour vos recrutements !');
        }

        if ($this->typeAction === 'accepte') {
            return $mail->subject('Bonne nouvelle ! Votre candidature a été acceptée')
                ->greeting('Bonjour ' . $this->candidature->etudiant->nom . ',')
                ->line("Félicitations ! L'entreprise " . $this->candidature->offreStage->entreprise->nom . " a accepté votre candidature pour l'offre : " . $this->candidature->offreStage->titre)
                ->line("L'entreprise va vous contacter très prochainement pour fixer les détails du stage.")
                ->action('Voir mon espace', url('/api/candidatures/' . $this->candidature->id))
                ->line('Bon courage dans votre stage !');
        }

        if ($this->typeAction === 'refuse') {
            return $mail->subject('Mise à jour concernant votre candidature')
                ->greeting('Bonjour ' . $this->candidature->etudiant->nom . ',')
                ->line("Nous vous remercions pour l'intérêt que vous avez porté à l'offre : " . $this->candidature->offreStage->titre)
                ->line("Malheureusement, l'entreprise a décidé de ne pas retenir votre candidature pour ce poste.")
                ->line("Ne vous découragez pas, d'autres opportunités vous attendent sur notre plateforme !");
        }

        return $mail;
   }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
