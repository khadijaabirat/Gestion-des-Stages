'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiFetch, getAvatarUrl } from '@/lib/api';

interface SearchResult {
  id: number;
  nom: string;
  role: string;
  filiere: string | null;
  description: string | null;
  adresse: string | null;
  photo: string | null;
}

export default function NavbarSearch({ basePath, scrolled }: { basePath: string, scrolled: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setResults(data.data || []);
            setIsOpen(true);
          }
        } catch (error) {
          console.error("Erreur de recherche", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, basePath]);

  const handleSelect = (userId: number) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/${basePath}/profile/${userId}`);
  };

  return (
    <div className="relative group w-full max-w-lg hidden md:block" ref={dropdownRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline-variant group-focus-within:text-primary transition-colors" />
      <input 
        type="text" 
        placeholder="Rechercher (étudiants, entreprises)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
          scrolled 
            ? 'bg-surface-container-lowest border border-outline-variant/30 shadow-sm' 
            : 'bg-surface-container-low/50 backdrop-blur-md border border-outline-variant/20'
        }`}
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-outline-variant/20 overflow-hidden z-50"
          >
            {results.length === 0 && !isSearching ? (
              <div className="p-4 text-center text-sm text-on-surface-variant">
                Aucun résultat trouvé.
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto py-2">
                {results.map((user) => (
                  <li key={user.id}>
                    <button
                      onClick={() => handleSelect(user.id)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container-lowest transition-colors flex items-center gap-3"
                    >
                      <img 
                        src={getAvatarUrl(user.nom, user.photo)} 
                        alt={user.nom} 
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-on-surface truncate">{user.nom}</p>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                          {user.role === 'entreprise' ? (
                            <><Building2 className="w-3 h-3" /> Entreprise</>
                          ) : (
                            <><User className="w-3 h-3" /> {user.filiere || 'Étudiant'}</>
                          )}
                          {user.adresse && <span className="ml-1 opacity-70 truncate max-w-[120px]">• {user.adresse}</span>}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
