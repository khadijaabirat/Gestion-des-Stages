'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Comment fonctionne le système de mise en relation ?",
    answer: "Notre plateforme analyse votre profil, vos compétences et vos préférences pour vous proposer les offres de stage les plus pertinentes. Les entreprises reçoivent également des recommandations basées sur leurs critères de recherche, garantissant un match parfait."
  },
  {
    question: "L'inscription est-elle gratuite pour les étudiants ?",
    answer: "Oui, l'accès à NexusIntern est totalement gratuit pour les étudiants. Vous pouvez créer votre profil, consulter les offres, postuler et utiliser la messagerie intégrée sans aucun frais."
  },
  {
    question: "Comment se déroule la signature des conventions ?",
    answer: "Tout se fait en ligne ! Une fois votre candidature acceptée, la convention de stage est générée automatiquement. Elle peut être signée électroniquement de manière légale et sécurisée par vous, l'entreprise et votre école."
  },
  {
    question: "Puis-je utiliser NexusIntern sur mon téléphone ?",
    answer: "Absolument. Notre plateforme est une Progressive Web App (PWA). Vous pouvez l'installer directement sur votre écran d'accueil et recevoir des notifications push en temps réel pour vos candidatures."
  },
  {
    question: "Les entreprises sont-elles vérifiées ?",
    answer: "Oui, chaque entreprise partenaire fait l'objet d'une vérification rigoureuse par nos équipes avant de pouvoir publier des offres. Nous garantissons ainsi un environnement professionnel et sécurisé."
  }
];

const FAQItem = ({ faq, index, isOpen, toggleOpen }: { faq: any, index: number, isOpen: boolean, toggleOpen: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="mb-4"
    >
      <button
        onClick={toggleOpen}
        className={`w-full text-left px-6 py-5 rounded-2xl glass-panel border transition-all duration-300 flex items-center justify-between group ${
          isOpen 
            ? 'border-primary/50 shadow-[0_10px_30px_rgba(255,126,95,0.1)]' 
            : 'border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface/60'
        }`}
      >
        <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-primary' : 'text-on-background group-hover:text-primary'}`}>
          {faq.question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-surface-variant text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 text-on-surface-variant font-medium leading-relaxed border-l-2 border-primary/30 ml-6 mt-2">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-4xl mx-auto px-6 lg:px-12 mb-32 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant/50 border border-outline-variant/30 backdrop-blur-md mb-6"
        >
          <HelpCircle className="w-4 h-4 text-secondary" />
          <span className="text-sm font-bold tracking-wide uppercase text-on-surface-variant">Support & Aide</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-4xl md:text-5xl text-on-background font-black mb-6 tracking-tight"
        >
          Questions <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Fréquentes</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium"
        >
          Tout ce que vous devez savoir sur la plateforme NexusIntern. Si vous avez d'autres questions, notre équipe est là pour vous.
        </motion.p>
      </div>

      <div className="relative z-10">
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index} 
            faq={faq} 
            index={index} 
            isOpen={openIndex === index}
            toggleOpen={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
