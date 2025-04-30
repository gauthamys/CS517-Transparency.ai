import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Components
import JobDescriptionForm from './components/JobDescriptionForm';
import CandidateList from './components/CandidateList';
import CandidateDetails from './components/CandidateDetails';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [model, setModel] = useState('llama3.2');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [mode, setMode] = useState('advanced'); // 'basic' or 'advanced'

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const endpoint = mode === 'basic' 
        ? 'http://localhost:8000/api/basic_hiring'
        : 'http://localhost:8000/api/advanced_hiring';
        
      const response = await axios.post(endpoint, {
        job_description: jobDescription,
        model: model
      });
      
      setResults(response.data.results);
      if (response.data.results.length > 0) {
        setSelectedCandidate(response.data.results[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h1 className="text-2xl font-bold">Transparency</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Model:</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="llama3.2">Llama 3</option>
                  <option value="mistral">Mistral</option>
                  <option value="phi3">Phi-3</option>
                  <option value="gemma">Gemma</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Mode:</span>
                <div className="flex rounded-md overflow-hidden">
                  <button
                    onClick={() => setMode('basic')}
                    className={`px-3 py-1 text-sm ${mode === 'basic' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white'}`}
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => setMode('advanced')}
                    className={`px-3 py-1 text-sm ${mode === 'advanced' ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-white'}`}
                  >
                    Advanced
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <JobDescriptionForm 
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onSubmit={handleSubmit}
              loading={loading}
            />
            
            {error && (
              <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {results.length > 0 && (
              <CandidateList 
                candidates={results}
                selectedCandidate={selectedCandidate}
                setSelectedCandidate={setSelectedCandidate}
                mode={mode}
              />
            )}
          </div>
          
          <div className="lg:col-span-2">
            {loading ? (
              <LoadingSpinner />
            ) : selectedCandidate ? (
              <CandidateDetails 
                candidate={selectedCandidate}
                mode={mode}
              />
            ) : results.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">Select a candidate to view details</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          
        </div>
      </footer>
    </div>
  );
}

export default App;