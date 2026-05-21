import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<div className="p-8 text-center"><h1 className="text-3xl font-bold text-primary-600">SyncTask Pro</h1><p className="mt-4 text-secondary-500">Welcome to your task management platform.</p></div>} />
          {/* Routes will be added here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
