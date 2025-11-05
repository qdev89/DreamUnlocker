import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      // Error handled by auth context
      setIsLoggingOut(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your account information and settings
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="card">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Account Details</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="flex items-start gap-3">
              <UserCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Full Name</p>
                <p className="text-sm text-gray-600">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Address</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Member Since</p>
                <p className="text-sm text-gray-600">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            {/* Last Login */}
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Login</p>
                <p className="text-sm text-gray-600">
                  {formatDate(user?.lastLoginAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions Card */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Logout from your account"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Future Features Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xl" aria-hidden="true">ℹ️</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              More Features Coming Soon
            </h3>
            <p className="text-sm text-blue-800">
              In future updates, you'll be able to update your profile information,
              change your password, manage notification preferences, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
