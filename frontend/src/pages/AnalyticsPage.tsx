import React, { useState } from 'react';
import {
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  useDashboardStats,
  useTopSymbols,
  useTopEmotions,
  useSymbolCorrelations,

  useActivityData
} from '../hooks/useAnalytics';
import { useInterpretationThemes, usePersonalSymbolPatterns } from '../hooks/useInterpretation';

export const AnalyticsPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(30);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topSymbols, isLoading: symbolsLoading } = useTopSymbols(10);
  const { data: topEmotions, isLoading: emotionsLoading } = useTopEmotions(10);
  const { data: symbolCorrelations } = useSymbolCorrelations();
  // const { data: emotionPatterns } = useEmotionPatterns();
  const { data: activityData, isLoading: activityLoading } = useActivityData(selectedTimeframe);
  const { data: themes } = useInterpretationThemes();
  const { data: personalPatterns } = usePersonalSymbolPatterns();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dream Analytics</h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover patterns, insights, and deeper meanings in your dream journey
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
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
              <HeartIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Emotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dream Streak</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : 0} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            <CalendarDaysIcon className="inline h-5 w-5 mr-2" />
            Dream Activity
          </h2>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
            className="input-field w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {activityLoading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : activityData && activityData.length > 0 ? (
          <div className="h-64 flex items-end justify-between gap-1">
            {activityData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary-600 rounded-t transition-all duration-300 hover:bg-primary-700"
                  style={{
                    height: `${Math.max(4, (day.count / Math.max(...activityData.map(d => d.count))) * 240)}px`
                  }}
                  title={`${formatDate(day.date)}: ${day.count} dreams`}
                ></div>
                <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No activity data available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Symbols */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <SparklesIcon className="inline h-5 w-5 mr-2" />
            Most Frequent Symbols
          </h2>

          {symbolsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : topSymbols && topSymbols.length > 0 ? (
            <div className="space-y-4">
              {topSymbols.map((symbol, index) => (
                <div key={symbol.symbolName} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <span className="dream-symbol ml-3">{symbol.symbolName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(symbol.frequency / Math.max(...topSymbols.map(s => s.frequency))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {symbol.frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No symbols tracked yet</p>
            </div>
          )}
        </div>

        {/* Top Emotions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <HeartIcon className="inline h-5 w-5 mr-2" />
            Most Common Emotions
          </h2>

          {emotionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : topEmotions && topEmotions.length > 0 ? (
            <div className="space-y-4">
              {topEmotions.map((emotion, index) => (
                <div key={emotion.symbolName} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <span className="emotion-tag ml-3">{emotion.symbolName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(emotion.frequency / Math.max(...topEmotions.map(e => e.frequency))) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {emotion.frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No emotions tracked yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Symbol Correlations */}
      {symbolCorrelations && symbolCorrelations.topCategories && symbolCorrelations.topCategories.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <ArrowTrendingUpIcon className="inline h-5 w-5 mr-2" />
            Symbol Correlations
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Symbols that frequently appear together in your dreams
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symbolCorrelations.topCategories.slice(0, 6).map((correlation: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="dream-symbol text-sm">{correlation.symbol1}</span>
                    <span className="text-gray-400">+</span>
                    <span className="dream-symbol text-sm">{correlation.symbol2}</span>
                  </div>
                  <span className="text-sm font-medium text-primary-600">
                    {(correlation.correlationStrength * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${correlation.correlationStrength * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interpretation Themes */}
      {themes && themes.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            <EyeIcon className="inline h-5 w-5 mr-2" />
            Common Interpretation Themes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{theme.overallTheme}</h3>
                <p className="text-sm text-gray-600 mb-3">{theme.overallTheme}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Dream interpretation
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Symbol Patterns */}
      {personalPatterns && personalPatterns.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Personal Symbol Evolution
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            How your relationship with symbols has evolved over time
          </p>

          <div className="space-y-4">
            {personalPatterns.slice(0, 5).map((pattern, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{pattern.overallTheme}</h3>
                    <p className="text-sm text-gray-600">
                      Dream interpretation pattern
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{pattern.overallTheme}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
