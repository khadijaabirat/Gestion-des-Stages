import { Building } from 'lucide-react';

export default function Partners({ partners: dynamicPartners }: { partners?: any[] }) {
  const defaultPartners = ['CAPGEMINI', 'THALES', 'L\'ORÉAL', 'ORANGE', 'DASSAULT SYSTÈMES', 'SOCIÉTÉ GÉNÉRALE', 'BNP PARIBAS', 'AIRBUS', 'LVMH', 'UBISOFT'];
  
  const displayPartners = dynamicPartners && dynamicPartners.length >= 5 
    ? dynamicPartners 
    : defaultPartners.map(name => ({ nom: name, logo: null }));

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-32">
      <div className="glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50 pointer-events-none" />
        
        <h3 className="font-mono text-xs text-on-surface-variant text-center mb-10 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-on-surface-variant/30" />
          Ils construisent l'avenir avec nous
          <span className="w-8 h-px bg-on-surface-variant/30" />
        </h3>
        
        {/* Mask image for fade out effect on edges */}
        <div 
          className="marquee-container overflow-hidden relative py-4"
          style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <div className="flex animate-marquee whitespace-nowrap gap-16 items-center">
            {[...displayPartners, ...displayPartners].map((partner, i) => (
              <span
                key={i}
                className="text-2xl md:text-3xl font-heading font-black text-on-surface-variant/40 hover:text-primary transition-all duration-500 flex items-center gap-3 cursor-pointer hover:scale-110"
              >
                {partner.logo ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${partner.logo}`} alt={partner.nom} className="h-10 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                ) : (
                  <Building className="w-8 h-8 opacity-50" />
                )}
                {partner.nom}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
