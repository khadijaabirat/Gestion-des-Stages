'use client';

import { useState, useEffect } from 'react';


import WelcomeHero from './cards/WelcomeHero';
import SkillRadar from './cards/SkillRadar';
import UpcomingEvents from './cards/UpcomingEvents';
import MotivationQuote from './cards/MotivationQuote';
import ActivityFeed from './cards/ActivityFeed';
import QuickActions from './cards/QuickActions';
import { apiFetch } from '@/lib/api';

export default function DashboardContent() {
  const [scrollY, setScrollY] = useState(0);

  // Backend Data State
  const [userData, setUserData] = useState<any>(null);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Backend Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, candidaturesRes] = await Promise.all([
          apiFetch('/profil'),
          apiFetch('/candidatures')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserData(profileData.data);
        }
        
        if (candidaturesRes.ok) {
          const candidaturesData = await candidaturesRes.json();
          const candidaturesArray = candidaturesData.data?.data || candidaturesData.data || candidaturesData;
          setCandidatures(Array.isArray(candidaturesArray) ? candidaturesArray : []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="h-full w-full relative overflow-x-hidden bg-background">
      {/* Static Ambient Gradients */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none z-0 opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(165,59,34, 0.12) 0%, transparent 70%)' }}
      />
      <div className="fixed bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none z-0 opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(86, 68, 208, 0.1) 0%, transparent 70%)' }}
      />

      {/* Navigation */}
      
      
      

      {/* Main Content */}
      <main className="w-full pt-24 md:pt-10 p-4 md:p-10 pb-24 relative z-10">

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {loading ? (
            <div className="col-span-1 md:col-span-12 flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <WelcomeHero user={userData} />
              <SkillRadar skills={userData?.skills || []} />
              <UpcomingEvents candidatures={candidatures} />
              <MotivationQuote />
              <ActivityFeed candidatures={candidatures} />
              <QuickActions />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

