'use client';

import { motion } from 'framer-motion';

import { Star, Quote, BadgeCheck } from 'lucide-react';

const testimonials = [
  {
    name: 'Yassine El Amrani',
    role: 'Étudiant en Informatique',
    school: 'ENSA Marrakech',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    text: "Grâce à NexusIntern, j'ai décroché un stage chez une entreprise tech en seulement 2 semaines. La plateforme m'a proposé exactement ce que je cherchais. Une expérience incroyable !",
    color: 'from-primary to-secondary',
    tag: 'Stage décroché en 14 jours'
  },
  {
    name: 'Sofia Bennani',
    role: 'Étudiante en Marketing Digital',
    school: 'ENCG Casablanca',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    text: "La plateforme est magnifique et ultra intuitive. J'ai pu créer mon profil, uploader mon CV et postuler à 5 offres en moins d'une heure. Les entreprises répondent vite !",
    color: 'from-purple-500 to-fuchsia-600',
    tag: '5 offres en 1 heure'
  },
  {
    name: 'Karim Tazi',
    role: 'Responsable RH',
    school: 'Capgemini Maroc',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    rating: 5,
    text: "En tant qu'entreprise, NexusIntern nous a permis de trouver des profils qualifiés rapidement. L'interface de gestion des candidatures est la meilleure du marché.",
    color: 'from-blue-500 to-indigo-600',
    tag: 'Recruteur vérifié'
  },
  {
    name: 'Amina Chraibi',
    role: 'Étudiante en Data Science',
    school: 'EMI Rabat',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 4,
    text: "Le système de messagerie intégré est top. J'ai pu échanger directement avec le RH de l'entreprise avant même l'entretien. Très professionnel et moderne.",
    color: 'from-emerald-500 to-teal-600',
    tag: 'Communication directe'
  },
  {
    name: 'Omar Fassi',
    role: 'Étudiant en Génie Logiciel',
    school: 'INPT Rabat',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 5,
    text: "J'ai testé plusieurs plateformes de stages, NexusIntern est de loin la plus belle et la plus efficace. Le dashboard étudiant est une vraie pépite. Je recommande à 100% !",
    color: 'from-amber-500 to-orange-600',
    tag: 'Recommandé à 100%'
  },
  {
    name: 'Leila Alaoui',
    role: 'Directrice de Stage',
    school: 'Thales Maroc',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    rating: 5,
    text: "Nous utilisons NexusIntern depuis 6 mois. La qualité des candidats a considérablement augmenté. La plateforme fait un travail remarquable de présélection.",
    color: 'from-rose-500 to-pink-600',
    tag: 'Entreprise partenaire'
  }
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant/50 border border-outline-variant/30 backdrop-blur-md mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="text-sm font-bold tracking-wide uppercase text-on-surface-variant">Témoignages Vérifiés</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl text-on-background font-black mb-6 tracking-tight"
        >
          Ce que disent <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-primary">nos utilisateurs</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto font-medium"
        >
          Des milliers d'étudiants et d'entreprises nous font confiance. Découvrez leurs expériences authentiques.
        </motion.p>
      </div>

      {/* Testimonials Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.08, type: "spring", stiffness: 100 }}
            className="break-inside-avoid group"
          >
            <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-outline-variant/20 hover:border-primary/20">
              
              {/* Hover Glow */}
              <div className={`absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b ${t.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none blur-[50px]`} />

              {/* Quote Icon */}
              <div className="mb-6 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-lg opacity-90`}>
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-5 relative z-10">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`w-4 h-4 ${si < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-on-surface-variant/20'}`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-base text-on-surface-variant leading-relaxed font-medium mb-8 relative z-10">
                "{t.text}"
              </p>

              {/* Tag Badge */}
              <div className="mb-6 relative z-10">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r ${t.color} text-white shadow-md`}>
                  <BadgeCheck className="w-3 h-3" />
                  {t.tag}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-outline-variant/15">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg ring-2 ring-background group-hover:ring-primary/30 transition-all duration-500 flex-shrink-0">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-background truncate">{t.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{t.role}</p>
                  <p className="text-[10px] font-mono font-bold text-primary/80 uppercase tracking-wider mt-0.5">{t.school}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
