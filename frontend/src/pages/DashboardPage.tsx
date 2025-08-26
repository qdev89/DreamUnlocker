import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  CalendarDaysIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useDashboardStats, useTopSymbols } from '../hooks/useAnalytics';
import { useDreams } from '../hooks/useDreams';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topSymbols, isLoading: symbolsLoading } = useTopSymbols(5);
  // const { data: topEmotions, isLoading: emotionsLoading } = useTopEmotions(5);
  const { data: recentDreams, isLoading: dreamsLoading } = useDreams(3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Continue your journey of dream exploration and self-discovery
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Dreams</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.totalDreams || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-8 w-8 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Symbols</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats?.totalSymbols || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FireIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dream Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : 0} days
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Dream</p>
              <p className="text-sm font-bold text-gray-900">
                {statsLoading ? '...' : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/dreams/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <PlusIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Record New Dream</p>
              <p className="text-sm text-gray-600">Capture your latest dream</p>
            </div>
          </Link>

          <Link
            to="/dreams"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <BookOpenIcon className="h-6 w-6 text-secondary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Dream Journal</p>
              <p className="text-sm text-gray-600">Browse your dream history</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Explore patterns & insights</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Dreams */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Dreams</h2>
            <Link to="/dreams" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          {dreamsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentDreams?.length ? (
            <div className="space-y-4">
              {recentDreams.slice(0, 3).map((dream) => (
                <Link
                  key={dream.id}
                  to={`/dreams/${dream.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="font-medium text-gray-900 truncate">{dream.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(dream.dreamDate.toISOString())} • {dream.symbols.length} symbols • {dream.emotions.length} emotions
                  </p>
                  {/* Interpretation status temporarily disabled for Firebase MVP */ false && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
                      Interpreted
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No dreams yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start by recording your first dream</p>
              <div className="mt-4">
                <Link to="/dreams/new" className="btn-primary">
                  Record Dream
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Top Symbols */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Top Symbols</h2>
            <Link to="/analytics" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          {symbolsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : topSymbols?.length ? (
            <div className="space-y-3">
              {topSymbols.map((symbol, index) => (
                <div key={symbol.symbolName} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-4">
                      {index + 1}.
                    </span>
                    <span className="dream-symbol ml-2">{symbol.symbolName}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {symbol.frequency}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No symbols tracked yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
