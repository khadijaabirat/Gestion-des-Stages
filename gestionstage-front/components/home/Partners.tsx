import { Building } from 'lucide-react';

export default function Partners({ partners: dynamicPartners }: { partners?: any[] }) {
  const defaultPartners = ['CAPGEMINI', 'THALES', 'L\'ORÉAL', 'ORANGE', 'DASSAULT SYSTÈMES', 'SOCIÉTÉ GÉNÉRALE', 'BNP PARIBAS', 'AIRBUS', 'LVMH', 'UBISOFT'];
  
  const displayPartners = dynamicPartners && dynamicPartners.length >= 5 
    ? dynamicPartners 
    : defaultPartners.map(name => ({ nom: name, logo: null }));

  return (
    <section className="max-w-[100vw] overflow-hidden mb-16 relative py-8">
      
      <h3 className="font-mono text-xs text-on-surface-variant text-center mb-12 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4">
        <span className="w-12 h-px bg-gradient-to-r from-transparent to-on-surface-variant/50" />
        Ils construisent l'avenir avec nous
        <span className="w-12 h-px bg-gradient-to-l from-transparent to-on-surface-variant/50" />
      </h3>
      
      {/* Infinite Marquee Container */}
      <div 
        className="marquee-container relative flex overflow-hidden w-full bg-surface-container/20 border-y border-white/5 py-8"
        style={{ 
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', 
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' 
        }}
      >
        <div className="flex animate-marquee whitespace-nowrap gap-24 items-center pl-24">
          {[...displayPartners, ...displayPartners, ...displayPartners].map((partner, i) => (
            <span
              key={i}
              className="text-3xl md:text-4xl font-heading font-black text-on-surface-variant/30 hover:text-on-background transition-all duration-500 flex items-center gap-4 cursor-pointer hover:scale-105"
            >
              {partner.logo ? (
                <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${partner.logo}`} alt={partner.nom} className="h-12 object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
              ) : (
                <Building className="w-10 h-10 opacity-30" />
              )}
              {partner.nom}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
