import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import ProcessRoadmap from '@/components/home/ProcessRoadmap';
import Partners from '@/components/home/Partners';
import FeaturedOpportunities from '@/components/home/FeaturedOpportunities';
import AIMatching from '@/components/home/AIMatching';
import GlobalEcosystem from '@/components/home/GlobalEcosystem';
import AIMentorship from '@/components/home/AIMentorship';
import WordSphere from '@/components/home/WordSphere';
import CTA from '@/components/home/CTA';

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
    <main className="flex-grow pt-28 pb-0 relative z-10">
      <Hero />
      <Stats stats={data?.stats} />
      <ProcessRoadmap />
      <Partners partners={data?.partners} />
      <FeaturedOpportunities offres={data?.recent_offres} />
      <AIMatching />
      <GlobalEcosystem />
      <WordSphere />
      <AIMentorship />
      <CTA />
    </main>
  );
}
