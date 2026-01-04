import { useState } from 'react';
import Header from './components/Header';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-karspex-burgundy">
      <Header />
      <div className="flex items-center justify-center py-12">
        <div className="bg-karspex-cream rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-karspex-red mb-6 text-center">Spexadmin</h1>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setCount((c) => c + 1)}
              className="bg-karspex-red hover:bg-karspex-gold hover:text-karspex-black text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Count is {count}
            </button>
            <p className="mt-4 text-karspex-gray-800">
              Edit <code className="bg-karspex-white px-2 py-1 rounded">src/App.tsx</code> and save
              to test HMR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
