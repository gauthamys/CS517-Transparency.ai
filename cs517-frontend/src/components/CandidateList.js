import React from 'react';

const CandidateList = ({ candidates, selectedCandidate, setSelectedCandidate, mode }) => {
  // Function to determine candidate match status
  const getCandidateStatus = (candidate) => {
    if (mode === 'basic') {
      // For basic mode, check if "yes" appears in the evaluation
      const eva = candidate.evaluation.toLowerCase();
      if (eva.includes('yes') && !eval.includes('no')) return 'match';
      if (eva.includes('no')) return 'no-match';
      return 'maybe';
    } else {
      // For advanced mode, check the decision field
      const decision = candidate.evaluation.decision;
      if (decision === 'yes') return 'match';
      if (decision === 'no') return 'no-match';
      return 'maybe';
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Candidates ({candidates.length})</h2>
      
      <div className="space-y-3">
        {candidates.map((candidate, index) => {
          const status = getCandidateStatus(candidate);
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedCandidate === candidate 
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{candidate.candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.candidate.education}</p>
                </div>
                <div>
                  {status === 'match' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Match
                    </span>
                  )}
                  {status === 'no-match' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      No Match
                    </span>
                  )}
                  {status === 'maybe' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Maybe
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {candidate.candidate.years_of_experience} years experience
                </div>
                <div className="flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {candidate.candidate.skills.split(',')[0]}...
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateList;