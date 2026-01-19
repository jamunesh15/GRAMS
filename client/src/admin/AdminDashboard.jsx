import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import GramsLogo from '../components/GramsLogo';
import Reveal from '../components/Reveal';
import DashboardOverview from './components/DashboardOverview';
import GrievancesManagement from './components/GrievancesManagement';
import EscalationsManagement from './components/EscalationsManagement';
import EngineersManagement from './components/EngineersManagement';
import WardMap from './components/WardMap';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import BudgetManagement from './components/BudgetManagement';
import ResourceApproval from './components/ResourceApproval';
import { getDashboardStats } from '../Services/operations/adminAPI';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Auto-close sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await getDashboardStats(token);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'grievances', label: 'Grievances', icon: '📋' },
    { id: 'escalations', label: 'Escalations', icon: '⚠️' },
    { id: 'engineers', label: 'Engineers', icon: '👷' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'resources', label: 'Resources', icon: '📦' },
    { id: 'ward-map', label: 'Ward Map', icon: '🗺️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100/40 to-purple-100/30">
      {/* Mobile Hamburger Button - Bottom right position */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl hover:scale-110 transition-all"
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[999] mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed left-0 top-16 w-64 bg-gradient-to-b from-green-100 via-emerald-100 to-teal-100/80 backdrop-blur-sm shadow-lg transition-transform duration-300 h-[calc(100vh-4rem)] z-[1000] flex flex-col overflow-hidden`}
      >
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <GramsLogo size={40} />
              </div>
              <span className="text-gray-800 font-bold text-lg">GRAMS Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 z-[1001]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:pl-64">
        {/* Content Area */}
        <div className="pt-20 px-3 sm:px-6 lg:px-8 pb-32">
          {activeTab === 'overview' && <DashboardOverview stats={stats} loading={loading} onTabChange={setActiveTab} />}

          {activeTab === 'grievances' && <GrievancesManagement />}

          {activeTab === 'escalations' && <EscalationsManagement />}

          {activeTab === 'engineers' && <EngineersManagement />}

          {activeTab === 'budget' && <BudgetManagement />}

          {activeTab === 'resources' && <ResourceApproval />}

          {activeTab === 'ward-map' && <WardMap />}

          {activeTab === 'analytics' && <Analytics />}

          {activeTab === 'reports' && <Reports />}
        </div>
      </div>
    </div>
  );
}
