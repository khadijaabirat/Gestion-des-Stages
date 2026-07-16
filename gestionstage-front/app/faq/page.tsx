import FAQ from '@/components/home/FAQ';
import CTA from '@/components/home/CTA';

export const metadata = {
  title: 'FAQ | NexusIntern',
  description: 'Trouvez les réponses à vos questions fréquentes sur NexusIntern.',
};

export default function FAQPage() {
  return (
    <main className="flex-grow pt-32 pb-0 relative z-10 min-h-screen">
      {/* Aurora Background specifically for FAQ page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute -bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <FAQ />
      
      {/* On peut ajouter le CTA ici aussi pour inciter à l'inscription après avoir lu la FAQ */}
      <CTA />
    </main>
  );
}
