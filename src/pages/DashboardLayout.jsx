import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;