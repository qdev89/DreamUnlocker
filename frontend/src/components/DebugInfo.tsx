import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firebaseDreamsService, firebaseSymbolsService } from '../services/firebase';

export const DebugInfo: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testDreamsQuery = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Testing Firebase connection...');

      // First test: Can we read symbols?
      const symbols = await firebaseSymbolsService.getAllSymbols();
      console.log('Symbols query successful:', symbols.length, 'symbols');

      // Second test: Can we read dreams?
      console.log('Testing dreams query for user:', user);
      const dreams = await firebaseDreamsService.getUserDreams(user.id);
      console.log('Dreams query successful:', dreams);

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        symbolsCount: symbols.length,
        dreams,
        dreamsCount: dreams.length,
        success: true,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Query failed:', error);
      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        success: false,
        timestamp: new Date().toISOString()
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      testDreamsQuery();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <strong>Debug:</strong> No user logged in
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <button 
        onClick={testDreamsQuery}
        disabled={loading}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-2 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Dreams Query'}
      </button>
      <pre className="text-xs overflow-auto max-h-96">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};
