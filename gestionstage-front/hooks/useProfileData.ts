import { useState, useEffect, useCallback } from 'react';
import { apiFetch, authHeaders, API_BASE, getAvatarUrl, ApiErrorResponse, isApiErrorResponse } from '@/lib/api';

export interface Skill { id: number; nom: string; }
export interface Experience { id: number; titre: string; entreprise: string; date_debut: string; date_fin: string | null; }
export interface UserData {
  id: number; nom: string; email: string; telephone: string | null;
  adresse: string | null; bio: string | null; filiere: string | null;
  niveau_etude: string | null; photo: string | null; skills?: Skill[]; experiences?: Experience[];
}

export const useProfileData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{show: boolean; msg: string; type: 'success'|'error'}>({show: false, msg: '', type: 'success'});
  
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  const showToast = useCallback((msg: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, skillsRes] = await Promise.all([
        apiFetch('/profil'),
        apiFetch('/skills'),
      ]);
      if (!profRes.ok) throw new Error('Erreur de chargement');
      const profData = await profRes.json();
      setUserData(profData.data);
      if (skillsRes.ok) { 
        const d = await skillsRes.json(); 
        setAllSkills(Array.isArray(d) ? d : (d.data || [])); 
      }
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur de chargement';
      setError(msg); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchProfile(); 
  }, [fetchProfile]);

  const updateProfile = async (formData: FormData): Promise<UserData | null> => {
    try {
      const res = await apiFetch(`/profil`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setUserData(data.data);
      showToast('Profil mis à jour avec succès !');
      return data.data;
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
      return null;
    }
  };

  const syncSkills = async (selectedSkillIds: number[]): Promise<boolean> => {
    try {
      const res = await apiFetch(`/profil/skills`, {
        method: 'POST',
        body: JSON.stringify({ skills: selectedSkillIds }),
      });
      if (!res.ok) throw new Error('Erreur sync compétences');
      showToast('Compétences mises à jour !');
      return true;
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
      return false;
    }
  };

  const saveExperience = async (exp: any, editingExpId: number | null): Promise<boolean> => {
    try {
      const url = editingExpId 
        ? `/profil/experiences/${editingExpId}` 
        : `/profil/experiences`;
      const method = editingExpId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(exp),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      await fetchProfile();
      showToast(editingExpId ? 'Expérience modifiée !' : 'Expérience ajoutée !');
      return true;
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
      return false;
    }
  };

  const deleteExperience = async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch(`/profil/experiences/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur');
      await fetchProfile();
      showToast('Expérience supprimée');
      return true;
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
      return false;
    }
  };

  const changePassword = async (pwForm: any): Promise<boolean> => {
    try {
      const res = await apiFetch(`/profil/password`, {
        method: 'PUT',
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      showToast('Mot de passe changé avec succès !');
      return true;
    } catch (e: unknown) { 
      const msg = isApiErrorResponse(e) ? e.message : 'Erreur';
      showToast(msg, 'error'); 
      return false;
    }
  };

  return {
    userData,
    loading,
    error,
    toast,
    allSkills,
    fetchProfile,
    showToast,
    updateProfile,
    syncSkills,
    saveExperience,
    deleteExperience,
    changePassword
  };
};
