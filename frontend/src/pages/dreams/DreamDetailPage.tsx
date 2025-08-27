import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  SparklesIcon,
  HeartIcon,
  ArrowLeftIcon,
  TrashIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ClockIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { useDream, useDeleteDream } from '../../hooks/useDreams';
import { useInterpretation, useCreateInterpretation } from '../../hooks/useInterpretation';

export const DreamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dreamId = id || '';

  const { data: dream, isLoading: dreamLoading, error: dreamError } = useDream(dreamId);
  const { data: interpretation, isLoading: interpretationLoading } = useInterpretation(dreamId);
  const createInterpretationMutation = useCreateInterpretation();
  const deleteDreamMutation = useDeleteDream();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isGeneratingInterpretation, setIsGeneratingInterpretation] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const estimateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleGenerateInterpretation = async () => {
    setIsGeneratingInterpretation(true);
    try {
      await createInterpretationMutation.mutateAsync({
        dreamId,
        overallTheme: 'Generated interpretation',
        primaryMessage: 'Your dream interpretation is being generated...',
        integrationSuggestion: 'Please wait while we analyze your dream.',
        personalReflections: ''
      });
    } catch (error) {
      console.error('Failed to generate interpretation:', error);
    } finally {
      setIsGeneratingInterpretation(false);
    }
  };

  const handleDeleteDream = async () => {
    try {
      await deleteDreamMutation.mutateAsync(dreamId);
      navigate('/dreams');
    } catch (error) {
      console.error('Failed to delete dream:', error);
    }
  };

  if (dreamLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="card">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dreamError || !dream) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <SparklesIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Dream not found</h3>
            <p className="mt-2 text-sm text-gray-600">
              The dream you're looking for doesn't exist or has been deleted.
            </p>
            <div className="mt-6">
              <Link to="/dreams" className="btn-primary">
                Back to Dreams
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/dreams"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dreams
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.share && navigator.share({
                title: dream.title,
                text: dream.description.substring(0, 100) + '...',
                url: window.location.href,
              })}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:inline-flex hidden"
            >
              <ShareIcon className="h-4 w-4 mr-1" />
              Share
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Title and Metadata */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{dream.title}</h1>
          
          {/* Dream Metadata */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
              <div>
                <div className="font-medium">{formatDate(dream.dreamDate)}</div>
                <div className="text-xs text-gray-500">{formatRelativeTime(dream.dreamDate)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4 flex-shrink-0" />
              <span>{estimateReadingTime(dream.description)} min read</span>
            </div>
            
            <div className="flex items-center gap-1">
              <SparklesIcon className="h-4 w-4 flex-shrink-0" />
              <span>{dream.symbols?.length || 0} symbols</span>
            </div>
            
            <div className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4 flex-shrink-0" />
              <span>{dream.emotions?.length || 0} emotions</span>
            </div>

            {dream.createdAt && (
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4 flex-shrink-0" />
                <span>Added {formatRelativeTime(dream.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <TrashIcon className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Dream</h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete this dream? This action cannot be undone and will also delete any interpretations.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDeleteDream}
                  disabled={deleteDreamMutation.isPending}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteDreamMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dream Content */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mr-3"></span>
          Dream Description
        </h2>
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed font-serif text-lg"
            style={{ 
              fontFamily: "'Crimson Text', Georgia, serif",
              lineHeight: "1.75",
              textAlign: "justify" 
            }}
          >
            {dream.description.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4 first-letter:text-4xl first-letter:font-bold first-letter:text-primary-600 first-letter:float-left first-letter:mr-2 first-letter:mt-1">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        </div>
        
        {/* Word count and analysis */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>{dream.description.split(' ').length} words</span>
            <span>{dream.description.length} characters</span>
          </div>
          <div className="text-xs text-gray-400">
            Recorded {new Date(dream.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Symbols and Emotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symbols */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-secondary-600" />
              Symbols
            </h2>
            <span className="text-sm text-gray-500">
              {dream.symbols?.length || 0} identified
            </span>
          </div>
          
          {dream.symbols && dream.symbols.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {dream.symbols.map((symbolName, index) => (
                  <span
                    key={index}
                    className="dream-symbol group cursor-help relative"
                    title={`Click to learn more about the symbolism of "${symbolName}"`}
                  >
                    {symbolName}
                  </span>
                ))}
              </div>
              
              {/* Symbol stats */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                These symbols will be analyzed in your Jungian interpretation
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <SparklesIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No symbols recorded for this dream</p>
            </div>
          )}
        </div>

        {/* Emotions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <HeartIcon className="h-5 w-5 mr-2 text-primary-600" />
              Emotions
            </h2>
            <span className="text-sm text-gray-500">
              {dream.emotions?.length || 0} recorded
            </span>
          </div>
          
          {dream.emotions && dream.emotions.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {dream.emotions.map((emotionName, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <span className="emotion-tag">{emotionName}</span>
                  </div>
                ))}
              </div>
              
              {/* Emotion insights */}
              <div className="text-xs text-gray-500 pt-2 border-t">
                Emotional patterns help reveal your dream's deeper meaning
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <HeartIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No emotions recorded for this dream</p>
            </div>
          )}
        </div>
      </div>

      {/* Interpretation Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            <LightBulbIcon className="inline h-5 w-5 mr-2" />
            Jungian Interpretation
          </h2>

          {!interpretation && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={handleGenerateInterpretation}
                disabled={isGeneratingInterpretation || createInterpretationMutation.isPending}
                className="btn-primary inline-flex items-center gap-2 relative"
              >
                {isGeneratingInterpretation || createInterpretationMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating Interpretation...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    Generate Interpretation
                  </>
                )}
              </button>
              
              {!isGeneratingInterpretation && (
                <p className="text-sm text-gray-600">
                  Unlock the hidden meanings and archetypal insights in your dream
                </p>
              )}
            </div>
          )}
        </div>

        {interpretationLoading || isGeneratingInterpretation ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Analyzing your dream...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Exploring archetypal symbols and unconscious patterns
                </p>
              </div>
            </div>
            
            <div className="animate-pulse space-y-4">
              <div className="interpretation-section">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              
              <div className="interpretation-section">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        ) : interpretation ? (
          <div className="space-y-6">
            {/* Overall Theme */}
            <div className="interpretation-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Overall Theme</h3>
              <p className="text-gray-700">{interpretation.overallTheme}</p>
            </div>

            {/* Primary Message */}
            <div className="interpretation-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Message</h3>
              <p className="text-gray-700">{interpretation.primaryMessage}</p>
            </div>

            {/* Symbol Interpretations */}
            {interpretation.symbolInterpretations && interpretation.symbolInterpretations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Symbol Analysis</h3>
                <div className="space-y-4">
                  {interpretation.symbolInterpretations.map((symbolInterp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{symbolInterp.symbolName}</h4>
                      <p className="text-gray-700 mb-3">{symbolInterp.personalizedInterpretation}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-700">Light Aspect:</span>
                          <p className="text-gray-600 mt-1">{symbolInterp.lightAspect}</p>
                        </div>
                        <div>
                          <span className="font-medium text-red-700">Shadow Aspect:</span>
                          <p className="text-gray-600 mt-1">{symbolInterp.shadowAspect}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Insights */}
            {interpretation.emotionalInsights && interpretation.emotionalInsights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Insights</h3>
                <div className="space-y-3">
                  {interpretation.emotionalInsights.map((insight, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <h4 className="font-medium text-gray-900">{insight.emotionName}</h4>
                      <p className="text-gray-700 text-sm mt-1">{insight.insight}</p>
                      <p className="text-gray-600 text-xs mt-2 italic">{insight.jungianPerspective}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shadow Work */}
            {interpretation.shadowWork && (
              <div className="interpretation-section bg-gradient-to-br from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shadow Work</h3>
                <p className="text-gray-700 mb-4">{interpretation.shadowWork.shadowInterpretation}</p>

                {interpretation.shadowWork.integrationQuestions && interpretation.shadowWork.integrationQuestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Integration Questions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {interpretation.shadowWork.integrationQuestions.map((question: string, index: number) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Exploratory Questions */}
            {interpretation.exploratoryQuestions && interpretation.exploratoryQuestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  <ChatBubbleLeftRightIcon className="inline h-5 w-5 mr-2" />
                  Exploratory Questions
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    Reflect on these questions to deepen your understanding of the dream's meaning:
                  </p>
                  <ul className="space-y-2">
                    {interpretation.exploratoryQuestions.map((question, index) => (
                      <li key={index} className="text-sm text-blue-700">
                        <span className="font-medium">{index + 1}.</span> {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Integration Suggestion */}
            <div className="interpretation-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Integration Guidance</h3>
              <p className="text-gray-700">{interpretation.integrationSuggestion}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No interpretation yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate a Jungian interpretation to unlock the deeper meaning of your dream
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
