import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav';
import QuickAddModal from '../components/QuickAddModal';
import AffordabilityModal from '../components/AffordabilityModal';

export default function AppLayout() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAffordModalOpen, setIsAffordModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#090d16]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAffordModal={() => setIsAffordModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet context={{ triggerRefresh, refreshKey, onOpenAddModal: () => setIsAddModalOpen(true), onOpenAffordModal: () => setIsAffordModalOpen(true) }} />
          </div>
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav onOpenAddModal={() => setIsAddModalOpen(true)} />
      </div>

      {/* Global Modals */}
      <QuickAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onTransactionAdded={triggerRefresh} 
      />

      <AffordabilityModal 
        isOpen={isAffordModalOpen} 
        onClose={() => setIsAffordModalOpen(false)} 
        onPurchaseConfirmed={triggerRefresh} 
      />
    </div>
  );
}
