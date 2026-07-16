import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch, ApiErrorResponse, isApiErrorResponse } from '@/lib/api';

export type OfferStatus = 'published' | 'draft' | 'closed';

export interface Offer {
  id: string;
  titre: string;
  description: string;
  duree: string;
  statut: OfferStatus;
  localisation: string;
  date_debut: string;
  date_expiration: string;
  created_at: string;
  candidatures_count?: number;
  latitude?: string | number | null;
  longitude?: string | number | null;
}

export const useEntrepriseOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Toutes');
  const [sortBy, setSortBy] = useState<'Recent' | 'Candidates'>('Recent');
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const fetchOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [offersRes, profileRes] = await Promise.all([
        apiFetch('/entreprise/mes-offres'),
        apiFetch('/profil')
      ]);
      
      if (offersRes.ok) {
        const json = await offersRes.json();
        const fetchedOffers = json.data?.data || json.data || [];
        setOffers(fetchedOffers);
      }
      
      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        if (profileJson.data && profileJson.data.est_valide !== undefined) {
          setIsValid(profileJson.data.est_valide);
        }
      }
    } catch (e: unknown) {
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur de connexion';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filteredOffers = useMemo(() => {
    let result = offers.filter(o => {
      const matchesSearch = o.titre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            o.localisation?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'Toutes' || 
                           (statusFilter === 'Active' && o.statut === 'published') ||
                           (statusFilter === 'Brouillon' && o.statut === 'draft') ||
                           (statusFilter === 'Clôturée' && o.statut === 'closed');
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'Recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (b.candidatures_count || 0) - (a.candidatures_count || 0);
      }
    });

    return result;
  }, [offers, searchQuery, statusFilter, sortBy]);

  const deleteOffer = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/entreprise/offres/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.id !== id));
        showToast('Offre supprimée définitivement.', 'success');
        return true;
      } else {
        showToast('Erreur lors de la suppression.', 'error');
        return false;
      }
    } catch (e: unknown) {
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur de connexion.';
      showToast(msg, 'error');
      return false;
    }
  };

  const saveOffer = async (formData: Omit<Offer, 'id' | 'created_at'>, editingOfferId?: string): Promise<boolean> => {
    try {
      const url = editingOfferId ? `/entreprise/offres/${editingOfferId}` : `/entreprise/offres`;
      const method = editingOfferId ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast(editingOfferId ? 'Offre modifiée avec succès' : 'Offre publiée avec succès', 'success');
        fetchOffers();
        return true;
      } else {
        const errorData = await res.json() as ApiErrorResponse;
        showToast(errorData.message || 'Erreur lors de la sauvegarde', 'error');
        return false;
      }
    } catch (error: unknown) {
      const msg = isApiErrorResponse(error) ? error.message : 'Erreur de connexion';
      showToast(msg, 'error');
      return false;
    }
  };

  return {
    offers: filteredOffers,
    isLoading,
    isValid,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    toast,
    deleteOffer,
    saveOffer
  };
};
