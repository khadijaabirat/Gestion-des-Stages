<?php

namespace App\Enums;

enum CandidatureStatus: string
{
    case EN_ATTENTE = 'en_attente';
    case ACCEPTE = 'accepte';
    case REFUSE = 'refuse';
    case ANNULE = 'annule';

    public function label(): string
    {
        return match($this) {
            self::EN_ATTENTE => 'En attente',
            self::ACCEPTE => 'Acceptée',
            self::REFUSE => 'Refusée',
            self::ANNULE => 'Annulée',
        };
    }
}
