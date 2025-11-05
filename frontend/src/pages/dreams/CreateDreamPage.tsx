import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  SparklesIcon,
  HeartIcon,
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
  BookmarkIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useCreateDream, useSymbols, useEmotions } from '../../hooks/useDreams';
import type { DreamCreateData } from '../../types/firebase';
import { logger } from '../../lib/logger';

export const CreateDreamPage: React.FC = () => {
  const navigate = useNavigate();
  const createDreamMutation = useCreateDream();
  const { data: symbols } = useSymbols();
  const { data: emotions } = useEmotions();

  const [formData, setFormData] = useState<DreamCreateData>({
    title: '',
    description: '',
    dreamDate: new Date(),
    symbols: [],
    emotions: [],
  });

  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [symbolFilter, setSymbolFilter] = useState('');
  const [showSymbolTooltip, setShowSymbolTooltip] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  // Auto-save draft functionality
  useEffect(() => {
    const saveDraft = () => {
      const draft = {
        title: formData.title,
        description: formData.description,
        dreamDate: formData.dreamDate.toISOString(),
        symbols: selectedSymbols,
        emotions: selectedEmotions,
        timestamp: Date.now()
      };
      localStorage.setItem('dream-draft', JSON.stringify(draft));
      setIsDraftSaved(true);
    };

    const timeoutId = setTimeout(() => {
      if (formData.title || formData.description) {
        saveDraft();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, selectedSymbols, selectedEmotions]);

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = () => {
      const draft = localStorage.getItem('dream-draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          const draftAge = Date.now() - parsed.timestamp;
          
          // Only load draft if it's less than 24 hours old
          if (draftAge < 24 * 60 * 60 * 1000) {
            setFormData({
              title: parsed.title || '',
              description: parsed.description || '',
              dreamDate: parsed.dreamDate ? new Date(parsed.dreamDate) : new Date(),
              symbols: [],
              emotions: []
            });
            setSelectedSymbols(parsed.symbols || []);
            setSelectedEmotions(parsed.emotions || []);
          }
        } catch (error) {
          logger.error('Error loading draft', error);
        }
      }
    };

    loadDraft();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dreamDate || isNaN(formData.dreamDate.getTime())) {
      newErrors.dreamDate = 'Dream date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dreamData: DreamCreateData = {
        ...formData,
        symbols: selectedSymbols,
        emotions: selectedEmotions,
      };

      const newDream = await createDreamMutation.mutateAsync(dreamData);
      
      // Clear draft after successful submission
      localStorage.removeItem('dream-draft');
      
      navigate(`/dreams/${newDream.id}`);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create dream' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'dreamDate') {
      setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset draft saved status when user types
    setIsDraftSaved(false);
  };

  const addSymbol = (symbolName: string) => {
    if (symbolName && !selectedSymbols.includes(symbolName)) {
      setSelectedSymbols(prev => [...prev, symbolName]);
    }
  };

  const removeSymbol = (symbolName: string) => {
    setSelectedSymbols(prev => prev.filter(s => s !== symbolName));
  };

  const addNewSymbol = () => {
    if (newSymbol.trim() && !selectedSymbols.includes(newSymbol.trim())) {
      setSelectedSymbols(prev => [...prev, newSymbol.trim()]);
      setNewSymbol('');
    }
  };

  const toggleEmotion = (emotionName: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionName)
        ? prev.filter(name => name !== emotionName)
        : [...prev, emotionName]
    );
  };

  // Filter symbols based on search
  const filteredSymbols = symbols?.filter(symbol => 
    symbol.name.toLowerCase().includes(symbolFilter.toLowerCase()) ||
    symbol.category.toLowerCase().includes(symbolFilter.toLowerCase())
  ) || [];

  // Character count for description
  const descriptionCount = formData.description.length;
  const maxDescriptionLength = 2000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record New Dream</h1>
            <p className="mt-1 text-sm text-gray-600">
              Capture the details of your dream for Jungian analysis and interpretation
            </p>
          </div>
          {isDraftSaved && (
            <div className="flex items-center text-sm text-green-600">
              <BookmarkIcon className="h-4 w-4 mr-1" />
              Draft saved
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dream Details</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Dream Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`input-field mt-1 ${errors.title ? 'border-red-300' : ''}`}
                placeholder="Give your dream a memorable title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="dreamDate" className="block text-sm font-medium text-gray-700">
                <CalendarDaysIcon className="inline h-4 w-4 mr-1" />
                Dream Date *
              </label>
              <input
                type="date"
                id="dreamDate"
                name="dreamDate"
                value={formData.dreamDate.toISOString().split('T')[0]}
                onChange={handleInputChange}
                className={`input-field mt-1 ${errors.dreamDate ? 'border-red-300' : ''}`}
              />
              {errors.dreamDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dreamDate}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Dream Description *
                </label>
                <span className={`text-sm ${
                  descriptionCount > maxDescriptionLength ? 'text-red-600' : 
                  descriptionCount > maxDescriptionLength * 0.9 ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {descriptionCount.toLocaleString()}/{maxDescriptionLength.toLocaleString()}
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={6}
                maxLength={maxDescriptionLength}
                value={formData.description}
                onChange={handleInputChange}
                className={`textarea-field mt-1 ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Describe your dream in as much detail as you can remember. Include people, places, objects, actions, and feelings..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <div className="flex items-start justify-between mt-1">
                <p className="text-sm text-gray-500">
                  The more detail you provide, the richer your interpretation will be.
                </p>
                {descriptionCount > 50 && (
                  <div className="text-xs text-gray-400 ml-4">
                    {Math.ceil(descriptionCount / 250)} min read
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Symbols */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <SparklesIcon className="inline h-5 w-5 mr-2" />
            Dream Symbols
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Select symbols that appeared in your dream. These will be used for Jungian analysis.
          </p>

          {/* Selected Symbols */}
          {selectedSymbols.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Symbols:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSymbols.map((symbol) => (
                  <span
                    key={symbol}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800"
                  >
                    {symbol}
                    <button
                      type="button"
                      onClick={() => removeSymbol(symbol)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-secondary-600 hover:bg-secondary-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Symbol */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="Add a custom symbol..."
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewSymbol())}
              />
              <button
                type="button"
                onClick={addNewSymbol}
                className="btn-secondary inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Symbol Search */}
          <div>
            <label htmlFor="symbolFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Search Symbols:
            </label>
            <input
              type="text"
              id="symbolFilter"
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value)}
              placeholder="Search by name or category..."
              className="input-field"
            />
          </div>

          {/* Jungian Symbols */}
          {symbols && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <SparklesIcon className="h-4 w-4 mr-1" />
                Jungian Symbols {filteredSymbols.length > 0 && `(${filteredSymbols.length})`}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredSymbols.slice(0, 20).map((symbol) => (
                  <div key={symbol.id} className="relative">
                    <button
                      type="button"
                      onClick={() => addSymbol(symbol.name)}
                      disabled={selectedSymbols.includes(symbol.name)}
                      onMouseEnter={() => setShowSymbolTooltip(symbol.id)}
                      onMouseLeave={() => setShowSymbolTooltip(null)}
                      className={`w-full p-3 text-sm border rounded-lg text-left transition-colors duration-200 relative ${
                        selectedSymbols.includes(symbol.name)
                          ? 'bg-secondary-100 border-secondary-300 text-secondary-800'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{symbol.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{symbol.category}</div>
                        </div>
                        <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                    
                    {/* Tooltip */}
                    {showSymbolTooltip === symbol.id && (
                      <div className="absolute z-10 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg -top-2 left-full ml-2 transform -translate-y-full">
                        <div className="font-medium mb-1">{symbol.name}</div>
                        <div className="mb-2 opacity-90">{symbol.archetypalMeaning}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-green-300">Positive: </span>
                            {symbol.positiveAspect}
                          </div>
                          <div>
                            <span className="text-red-300">Shadow: </span>
                            {symbol.negativeAspect}
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-4 left-0 transform -translate-x-full">
                          <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredSymbols.length === 0 && symbolFilter && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No symbols found matching "{symbolFilter}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Emotions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <HeartIcon className="inline h-5 w-5 mr-2" />
            Dream Emotions
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Select the emotions you experienced during or after the dream.
          </p>

          {emotions && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => toggleEmotion(emotion.name)}
                  className={`p-3 text-sm border rounded-lg text-left transition-colors duration-200 ${
                    selectedEmotions.includes(emotion.name)
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{emotion.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{emotion.archetypalMeaning}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="card">
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createDreamMutation.isPending || !formData.title.trim() || !formData.description.trim()}
              className="btn-primary flex-1 relative"
            >
              {createDreamMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Recording Dream...
                </div>
              ) : (
                'Record Dream'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (formData.title || formData.description) {
                  const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                  if (!confirmLeave) return;
                }
                localStorage.removeItem('dream-draft');
                navigate('/dreams');
              }}
              disabled={createDreamMutation.isPending}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>

          {/* Helpful Tips */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <LightBulbIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" aria-hidden="true" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Tips for Better Dream Analysis:</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• Include emotions you felt during and after the dream</li>
                  <li>• Describe colors, sounds, and sensations in detail</li>
                  <li>• Note recurring elements or symbols from past dreams</li>
                  <li>• Don't worry about grammar - focus on capturing the essence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
