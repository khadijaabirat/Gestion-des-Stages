export default function Partners() {
  const partners = ['GOOGLE', 'META', 'AMAZON', 'TESLA', 'AIRBNB', 'SPOTIFY', 'MICROSOFT', 'NVIDIA'];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-24">
      <h3 className="font-mono text-xs text-on-surface-variant text-center mb-8 uppercase tracking-widest">
        Ils nous font confiance
      </h3>
      <div className="marquee-container overflow-hidden relative py-4">
        <div className="flex animate-marquee whitespace-nowrap gap-12 items-center">
          {[...partners, ...partners].map((partner, i) => (
            <span
              key={i}
              className="text-2xl font-bold text-on-surface-variant opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
