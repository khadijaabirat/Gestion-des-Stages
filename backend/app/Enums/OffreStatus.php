<?php

namespace App\Enums;

enum OffreStatus: string
{
    case PUBLISHED = 'published';
    case DRAFT = 'draft';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match($this) {
            self::PUBLISHED => 'Publiée',
            self::DRAFT => 'Brouillon',
            self::CLOSED => 'Clôturée',
        };
    }
}
