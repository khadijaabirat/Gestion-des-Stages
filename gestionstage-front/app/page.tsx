import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import ProcessRoadmap from '@/components/home/ProcessRoadmap';
import Partners from '@/components/home/Partners';
import TopEntreprises from '@/components/home/TopEntreprises';
import FeaturedOpportunities from '@/components/home/FeaturedOpportunities';
import SmartMatching from '@/components/home/SmartMatching';
import GlobalEcosystem from '@/components/home/GlobalEcosystem';
import ProMentorship from '@/components/home/ProMentorship';
import Testimonials from '@/components/home/Testimonials';
import CTA from '@/components/home/CTA';
import CustomCursor from '@/components/ui/CustomCursor';

async function getHomeData() {
  try {
    const res = await fetch('http://localhost:8000/api/home/data', {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching home data:', error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <CustomCursor />
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[50%] rounded-full bg-secondary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-tertiary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <main className="flex-grow pt-28 pb-0 relative z-10">
        <Hero />
        <Stats stats={data?.stats} />
        <ProcessRoadmap />
        <Partners partners={data?.partners} />
        <TopEntreprises entreprises={data?.partners} />
        <FeaturedOpportunities offres={data?.recent_offres} />
        <SmartMatching />
        <GlobalEcosystem />
        <Testimonials />
        <ProMentorship />
        <CTA />
      </main>
    </>
  );
}
