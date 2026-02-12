import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import Footer from './Footer';
import { initializeTheme } from '../../store';

const PublicLayout: React.FC = () => {
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1112]">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
