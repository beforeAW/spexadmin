import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Spexadmin</h1>
        <div className="text-center">
          <button
            type="button"
            onClick={() => setCount((c) => c + 1)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-gray-600">
            Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.tsx</code> and save to test
            HMR
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
