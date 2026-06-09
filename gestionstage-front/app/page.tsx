import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import ProcessRoadmap from '@/components/home/ProcessRoadmap';
import Partners from '@/components/home/Partners';
import FeaturedOpportunities from '@/components/home/FeaturedOpportunities';
import AIMatching from '@/components/home/AIMatching';
import GlobalEcosystem from '@/components/home/GlobalEcosystem';
import EliteMentors from '@/components/home/EliteMentors';
import AIMentorship from '@/components/home/AIMentorship';

export default function HomePage() {
  return (
    <main className="flex-grow pt-28 pb-0 relative z-10">
      <Hero />
      <Stats />
      <ProcessRoadmap />
      <Partners />
      <FeaturedOpportunities />
      <AIMatching />
      <GlobalEcosystem />
      <EliteMentors />
      <AIMentorship />
    </main>
  );
}
