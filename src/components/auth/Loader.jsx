import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 size={32} className="text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">SQL Quest</h2>
        <p className="text-gray-300">Loading your adventure...</p>
      </div>
    </div>
  );
};

export default Loader;
