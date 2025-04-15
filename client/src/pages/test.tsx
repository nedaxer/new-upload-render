import React, { useState } from 'react';

const TestPage = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to verify React hooks are working.</p>
      
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Decrease
        </button>
        
        <span className="font-bold text-xl">{count}</span>
        
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Increase
        </button>
      </div>
      
      <p className="text-sm text-gray-600">If you see this page with working buttons, hooks are functioning correctly.</p>
    </div>
  );
};

export default TestPage;