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
