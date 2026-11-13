import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from './EmployeeSidebar';
import { EmployeeNavbar } from './EmployeeNavbar';
import { ToastContainer } from '../common/ToastContainer';

export const EmployeeLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-[#F4F8F8] text-[#173B49] font-sans antialiased overflow-hidden selection:bg-[#57945A] selection:text-white">
      {/* Dedicated Employee Left Navigation Sidebar */}
      <EmployeeSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Employee Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <EmployeeNavbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6 max-w-[1550px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
