import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Avoid re-renders of children by returning null or a loading indicator,
    // but the issue requested to show minimal loading.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4ed]">
        <div className="w-8 h-8 rounded-full border-4 border-[#1c1c1c]/10 border-t-[#1c1c1c] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
