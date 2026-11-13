import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../common/ToastContainer';
import { CommandPalette } from '../common/CommandPalette';

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-[#F4F8F8] text-[#173B49] font-sans antialiased overflow-hidden selection:bg-[#087F8C] selection:text-white">
      {/* Persistent Left Navigation Sidebar (Insigrow Light Enterprise Style) */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Workspace Application Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Compact Enterprise Topbar */}
        <Navbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />

        {/* Structured Content Panel */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6 max-w-[1700px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette />

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
