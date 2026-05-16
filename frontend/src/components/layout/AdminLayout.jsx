import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth custom-scrollbar relative">
          {/* Subtle background patterns */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full -mr-80 -mt-80 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-600/5 blur-[120px] rounded-full -ml-80 -mb-80 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
