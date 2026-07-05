'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User as UserIcon, Building2, MapPin, Mail, MessageSquare, Loader2, Award, Briefcase, Phone, GraduationCap, FileText, ChevronRight } from 'lucide-react';
import { apiFetch, getAvatarUrl } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublicProfileContent({ userId, basePath }: { userId: string, basePath: string }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/users/${userId}`);
        if (!res.ok) throw new Error('Utilisateur introuvable ou profil privé');
        const data = await res.json();
        setProfile(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleSendMessage = async () => {
    try {
      setIsMessaging(true);
      const res = await apiFetch('/conversations', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Rediriger vers la messagerie avec la conversation sélectionnée
        router.push(`/${basePath}/messages?conv=${data.data.id}`);
      } else {
        const err = await res.json();
        toast.error(err.message || "Erreur lors de la création de la conversation");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="w-10 h-10 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Profil indisponible</h2>
        <p className="text-on-surface-variant max-w-md">{error}</p>
        <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors">
          Retour
        </button>
      </div>
    );
  }

  const isEntreprise = profile.role === 'entreprise';
  const avatarUrl = getAvatarUrl(profile.nom, profile.photo);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Header Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-outline-variant/20 overflow-hidden mb-8"
      >
        <div className="h-32 md:h-48 bg-gradient-to-r from-primary/80 to-secondary/80 relative">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        </div>
        
        <div className="px-6 md:px-10 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="p-1.5 bg-white rounded-2xl shadow-lg relative z-10">
              <img 
                src={avatarUrl} 
                alt={profile.nom} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-1">{profile.nom}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-on-surface-variant font-medium">
                {isEntreprise ? (
                  <span className="flex items-center gap-1.5 bg-surface-container py-1 px-3 rounded-full text-sm">
                    <Building2 className="w-4 h-4" /> Entreprise
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-surface-container py-1 px-3 rounded-full text-sm">
                    <UserIcon className="w-4 h-4" /> {profile.filiere || 'Étudiant'}
                  </span>
                )}
                {profile.adresse && (
                  <span className="flex items-center gap-1.5 bg-surface-container py-1 px-3 rounded-full text-sm">
                    <MapPin className="w-4 h-4" /> {profile.adresse}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <button 
                onClick={handleSendMessage}
                disabled={isMessaging}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isMessaging ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                Envoyer un message
              </button>
            </div>
          </div>
          
          {profile.description && (
            <div className="mt-8 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                À propos
              </h3>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {profile.description}
              </p>
            </div>
          )}

          {/* Informations de contact supplémentaires */}
          {(profile.telephone || profile.bio) && (
             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.telephone && (
                  <div className="flex items-center gap-3 bg-white border border-outline-variant/30 p-4 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-medium">Téléphone</p>
                      <p className="text-sm font-bold text-on-surface">{profile.telephone}</p>
                    </div>
                  </div>
                )}
                {profile.bio && (
                  <div className="flex items-center gap-3 bg-white border border-outline-variant/30 p-4 rounded-xl shadow-sm md:col-span-2">
                     <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex-shrink-0 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-medium">Bio Courte</p>
                      <p className="text-sm font-medium text-on-surface">{profile.bio}</p>
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>
      </motion.div>

      {/* Details Sections */}
      {!isEntreprise && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Niveau d'étude */}
          {profile.niveau_etude && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-6 md:p-8 md:col-span-2"
            >
              <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                Niveau d'étude
              </h3>
              <p className="text-on-surface-variant font-medium text-lg">{profile.niveau_etude}</p>
            </motion.div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-6 md:p-8"
            >
              <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: any) => (
                  <span 
                    key={skill.id} 
                    className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-xl text-sm"
                  >
                    {skill.nom}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Experiences */}
          {profile.experiences && profile.experiences.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-6 md:p-8"
            >
              <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Expériences & Formations
              </h3>
              <div className="space-y-6">
                {profile.experiences.map((exp: any) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-primary/20 pb-2 last:border-transparent last:pb-0">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-on-surface">{exp.titre}</h4>
                    <p className="text-sm font-semibold text-primary">{exp.entreprise}</p>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      {new Date(exp.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} 
                      {' - '}
                      {exp.date_fin ? new Date(exp.date_fin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Aujourd\'hui'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-on-surface-variant mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      {isEntreprise && profile.site_web && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-6 md:p-8 text-center mb-8"
        >
           <h3 className="text-xl font-bold text-on-surface mb-4">Site Web</h3>
           <a href={profile.site_web.startsWith('http') ? profile.site_web : `https://${profile.site_web}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium text-lg">
             {profile.site_web}
           </a>
        </motion.div>
      )}

      {/* Offres de stage de l'entreprise */}
      {isEntreprise && profile.offres_stages && profile.offres_stages.length > 0 && (
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-white rounded-3xl shadow-lg border border-outline-variant/20 p-6 md:p-8"
         >
           <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
             <Briefcase className="w-6 h-6 text-primary" />
             Offres de stage proposées ({profile.offres_stages.length})
           </h3>
           <div className="grid grid-cols-1 gap-4">
             {profile.offres_stages.map((offre: any) => (
                <div key={offre.id} className="p-5 border border-outline-variant/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors">
                  <div>
                    <h4 className="font-bold text-on-surface text-lg">{offre.titre}</h4>
                    <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2">
                      {offre.localisation && <span><MapPin className="w-3 h-3 inline mr-1" />{offre.localisation}</span>}
                      {offre.type_stage && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">{offre.type_stage}</span>}
                    </p>
                  </div>
                  <Link 
                    href={`/${basePath}/dashboard?offer=${offre.id}`} 
                    className="flex-shrink-0 flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Voir l'offre <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
             ))}
           </div>
         </motion.div>
      )}
    </div>
  );
}
