import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Button from './components/Button';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-karspex-burgundy flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="bg-karspex-cream rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-karspex-red mb-6 text-center">Spexadmin</h1>
          <div className="text-center">
            <Button
              size="sm"
              className="md:py-2 md:px-4 md:text-base"
              onClick={() => setCount((c) => c + 1)}
            >
              Count is {count}
            </Button>
            <p className="mt-4 text-karspex-gray-800">
              Edit <code className="bg-karspex-white px-2 py-1 rounded">src/App.tsx</code> and save
              to test HMR
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
