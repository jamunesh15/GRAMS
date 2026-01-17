import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RoleBasedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Role-based routing
    const role = user.role?.toLowerCase();
    
    if (role === 'admin' || role === 'moderator') {
      navigate('/admin', { replace: true });
    } else if (role === 'engineer') {
      navigate('/engineer-dashboard', { replace: true });
    } else {
      // Default user dashboard
      navigate('/user-dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
