import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

import Navbar from '../components/common/Navbar';
import Hero from '../components/LandingPage/Hero';
import { FeatureSection } from '../components/LandingPage/FeatureSection';
import FAQ from '../components/LandingPage/FAQ';
import Footer from '../components/common/Footer';

import ScrollProgress from '@/components/fx/ScrollProgress';
import CursorGlow from '@/components/fx/CursorGlow';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(`/user/${user.role}`);
  }, [user]);

  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    // Scroll on mount after a small delay to allow components to render
    const timer = setTimeout(handleHashScroll, 100);

    window.addEventListener('hashchange', handleHashScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  return (
    <div className="relative z-0">
      <ScrollProgress />
      <CursorGlow />
      <Navbar className="relative z-[1000]" />
      <Hero className="z-0" />
      <FeatureSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
