import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { useDashboardStats, useTopSymbols } from '../hooks/useAnalytics';
import { useDreams } from '../hooks/useDreams';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topSymbols, isLoading: symbolsLoading } = useTopSymbols(5);
  const { data: recentDreams, isLoading: dreamsLoading } = useDreams(3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const greetings = {
      morning: ['Good morning', 'Rise and shine', 'Hello there'],
      afternoon: ['Good afternoon', 'Hope your day is going well', 'Hello'],
      evening: ['Good evening', 'Hope you had a great day', 'Welcome back']
    };
    
    return greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)];
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-secondary-50 to-dream-50 p-8 border border-primary-100">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                {getGreeting()}, {user?.firstName}!
                {getTimeOfDay() === 'morning' && (
                  <SunIcon className="h-7 w-7 text-amber-500" aria-label="Morning" />
                )}
                {getTimeOfDay() === 'afternoon' && (
                  <SunIcon className="h-7 w-7 text-yellow-500" aria-label="Afternoon" />
                )}
                {getTimeOfDay() === 'evening' && (
                  <MoonIcon className="h-7 w-7 text-indigo-600" aria-label="Evening" />
                )}
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Ready to explore the mysteries of your unconscious mind?
              </p>
              
              {recentDreams && recentDreams.length > 0 ? (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>Last dream: {formatDate(recentDreams[0].dreamDate.toISOString())}</span>
                  </div>
                  {recentDreams.length >= 2 && (
                    <div className="flex items-center gap-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Active dreamer</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MoonIcon className="h-4 w-4" />
                  <span>Start your dream journey today</span>
                </div>
              )}
            </div>
            
            <div className="hidden sm:block">
              <Link
                to="/dreams/new"
                className="btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Record Dream
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary-100 opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-16 w-16 rounded-full bg-secondary-100 opacity-20"></div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Dreams</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="tabular-nums">{stats?.totalDreams || recentDreams?.length || 0}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {recentDreams?.length ? `${recentDreams.length} recent` : 'Start recording'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-3 bg-primary-100 rounded-xl">
                <BookOpenIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-secondary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Unique Symbols</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="tabular-nums">{stats?.totalSymbols || 0}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Archetypal patterns</p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <SparklesIcon className="h-8 w-8 text-secondary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Dream Streak</p>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  '0'
                )}
                <span className="text-base font-normal text-gray-600 ml-1">days</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Keep the momentum</p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FireIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  <span className="tabular-nums">{recentDreams?.length || 0}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {recentDreams?.length ? 'Great progress!' : 'Just getting started'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrophyIcon className="h-8 w-8 text-green-600" />
              </div>
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
