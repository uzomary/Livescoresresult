
import React from 'react';
import Header from './Header';
import Footer from './Footer';

import MetaTags from './MetaTags';

interface LayoutProps {
  children: React.ReactNode;
  showMobileNav?: boolean;
  onSearchClick?: () => void;
}

const Layout = ({ children, showMobileNav = true, onSearchClick = () => { } }: LayoutProps) => {
  return (
    <>
      <MetaTags />
      <div className="min-h-[100dvh] flex flex-col bg-background relative">
        <Header onSearchClick={onSearchClick} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-4 safe-bottom">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
            {children}
          </div>
        </main>

        <Footer className="hidden md:block" />


        <style>{`
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .safe-bottom {
              padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Layout;
