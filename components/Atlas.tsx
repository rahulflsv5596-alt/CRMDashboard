'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Masthead from './Masthead';
import MapPanel from './MapPanel';
import DetailPanel from './DetailPanel';
import ContactModal from './ContactModal';
import AddAgencyModal from './AddAgencyModal';
import Footer from './Footer';
import { initAtlas } from '@/lib/atlas';

export default function Atlas() {
  const booted = useRef(false);

  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactPreselectedState, setContactPreselectedState] = useState<string | null>(null);
  const [editContactId, setEditContactId] = useState<string | null>(null);

  // Agency modal state
  const [agencyModalOpen, setAgencyModalOpen] = useState(false);
  const [agencyPreselectedState, setAgencyPreselectedState] = useState<string | null>(null);

  // Open/close contact modal — called by atlas.ts via window globals
  const openContactModal = useCallback((state: string | null = null, contactId: string | null = null) => {
    setContactPreselectedState(state);
    setEditContactId(contactId);
    setContactModalOpen(true);
  }, []);

  const closeContactModal = useCallback(() => {
    setContactModalOpen(false);
    setContactPreselectedState(null);
    setEditContactId(null);
  }, []);

  // Open/close agency modal — called by atlas.ts via window globals
  const openAgencyModal = useCallback((state: string | null = null) => {
    setAgencyPreselectedState(state);
    setAgencyModalOpen(true);
  }, []);

  const closeAgencyModal = useCallback(() => {
    setAgencyModalOpen(false);
    setAgencyPreselectedState(null);
  }, []);

  // Expose all modal controls globally so atlas.ts imperative code can trigger them
  useEffect(() => {
    (window as any).__atlasOpenModal = openContactModal;
    (window as any).__atlasCloseModal = closeContactModal;
    (window as any).__atlasOpenAgencyModal = openAgencyModal;
    (window as any).__atlasCloseAgencyModal = closeAgencyModal;
  }, [openContactModal, closeContactModal, openAgencyModal, closeAgencyModal]);

  useEffect(() => {
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

      {contactModalOpen && (
        <ContactModal
          preselectedState={contactPreselectedState}
          contactId={editContactId}
          onClose={closeContactModal}
          onSaved={() => closeContactModal()}
        />
      )}

      {agencyModalOpen && (
        <AddAgencyModal
          preselectedState={agencyPreselectedState}
          onClose={closeAgencyModal}
          onSaved={() => {
            closeAgencyModal();
            // Optionally refresh the CRM list if atlas.ts exposes a refresh hook
            if (typeof (window as any).__atlasRefreshContacts === 'function') {
              (window as any).__atlasRefreshContacts();
            }
          }}
        />
      )}

      <Footer />
    </>
  );
}
