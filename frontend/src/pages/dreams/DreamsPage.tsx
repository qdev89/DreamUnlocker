import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  SparklesIcon,
  CalendarDaysIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useDreams, useDeleteDream, useSearchDreams } from '../../hooks/useDreams';
import { logger } from '../../lib/logger';

export const DreamsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: dreamsData, isLoading, error } = useDreams();


  const { data: searchResults, isLoading: searchLoading } = useSearchDreams(searchQuery);
  const deleteDreamMutation = useDeleteDream();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteDream = async (dreamId: string) => {
    try {
      await deleteDreamMutation.mutateAsync(dreamId);
      setShowDeleteConfirm(null);
    } catch (error) {
      logger.error('Failed to delete dream', error);
    }
  };

  const displayDreams = searchQuery.length > 2 ? searchResults : dreamsData;
  const isSearching = searchQuery.length > 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dream Journal</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your personal collection of dreams and their interpretations
          </p>
        </div>

        <Link
          to="/dreams/new"
          className="btn-primary inline-flex items-center gap-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Dream
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search your dreams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isSearching && (
          <div className="mt-2 text-sm text-gray-600">
            {searchLoading ? 'Searching...' : `Found ${searchResults?.length || 0} dreams`}
          </div>
        )}
      </div>

      {/* Dreams List */}
      {isLoading ? (
        <div className="card">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <BookOpenIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Error loading dreams</h3>
            <p className="mt-2 text-sm text-gray-600">
              There was a problem loading your dreams. Please try again.
            </p>
            <p className="mt-2 text-xs text-red-600 font-mono">
              {error?.message || String(error)}
            </p>
          </div>
        </div>
      ) : !displayDreams?.length ? (
        <div className="card">
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">
              {isSearching ? 'No dreams found' : 'No dreams yet'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {isSearching
                ? 'Try adjusting your search terms'
                : 'Start by recording your first dream to begin your analysis journey'
              }
            </p>
            {!isSearching && (
              <div className="mt-6">
                <Link to="/dreams/new" className="btn-primary">
                  Record Your First Dream
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayDreams.map((dream) => (
            <div key={dream.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {dream.title}
                    </h3>
                    {/* Interpretation status temporarily disabled for Firebase MVP */ false && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <SparklesIcon className="h-3 w-3 mr-1" />
                        Interpreted
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="h-4 w-4" />
                      {formatDate(dream.dreamDate.toISOString())}
                    </div>
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="h-4 w-4" />
                      {dream.symbols.length} symbols
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 rounded-full bg-primary-200"></div>
                      {dream.emotions.length} emotions
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Created {formatDate(dream.createdAt.toISOString())}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Link
                    to={`/dreams/${dream.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Link>

                  <button
                    onClick={() => setShowDeleteConfirm(dream.id)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === dream.id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    Are you sure you want to delete this dream? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteDream(dream.id)}
                      disabled={deleteDreamMutation.isPending}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteDreamMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
