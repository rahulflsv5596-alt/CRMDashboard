'use client';

import { useEffect, useRef } from 'react';
import Masthead from './Masthead';
import MapPanel from './MapPanel';
import DetailPanel from './DetailPanel';
import ContactModal from './ContactModal';
import Footer from './Footer';
import { initAtlas } from '@/lib/atlas';

export default function Atlas() {
  const booted = useRef(false);

  useEffect(() => {
    // Run the imperative D3 + CRM boot exactly once, after the markup is mounted.
    if (booted.current) return;
    booted.current = true;
    initAtlas();
  }, []);

  return (
    <>
      <Masthead />
      <main className="app">
        <MapPanel />
        <DetailPanel />
      </main>
      <ContactModal />
      <Footer />
    </>
  );
}
