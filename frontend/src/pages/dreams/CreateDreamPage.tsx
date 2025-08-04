import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  SparklesIcon,
  HeartIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useCreateDream, useSymbols, useEmotions } from '../../hooks/useDreams';
import type { DreamCreateData } from '../../types/firebase';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Record New Dream</h1>
        <p className="mt-1 text-sm text-gray-600">
          Capture the details of your dream for Jungian analysis and interpretation
        </p>
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Dream Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleInputChange}
                className={`textarea-field mt-1 ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Describe your dream in as much detail as you can remember. Include people, places, objects, actions, and feelings..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                The more detail you provide, the richer your interpretation will be.
              </p>
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

          {/* Common Symbols */}
          {symbols && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Common Symbols:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {symbols.slice(0, 20).map((symbol) => (
                  <button
                    key={symbol.id}
                    type="button"
                    onClick={() => addSymbol(symbol.name)}
                    disabled={selectedSymbols.includes(symbol.name)}
                    className={`p-2 text-sm border rounded-lg text-left transition-colors duration-200 ${
                      selectedSymbols.includes(symbol.name)
                        ? 'bg-secondary-100 border-secondary-300 text-secondary-800'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {symbol.name}
                  </button>
                ))}
              </div>
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
              disabled={createDreamMutation.isPending}
              className="btn-primary flex-1"
            >
              {createDreamMutation.isPending ? 'Recording Dream...' : 'Record Dream'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dreams')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
