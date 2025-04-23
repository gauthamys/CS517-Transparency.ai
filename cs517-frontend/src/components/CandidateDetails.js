import React from 'react';

const CandidateDetails = ({ candidate, mode }) => {
  // For advanced mode, extract structured data
  const isAdvanced = mode === 'advanced';
  const decision = isAdvanced ? candidate.evaluation.decision : null;
  const confidence = isAdvanced ? candidate.evaluation.confidence : null;
  const explanation = isAdvanced ? candidate.evaluation.explanation : candidate.evaluation;
  
  // Calculate the confidence circle
  const getConfidenceCircle = () => {
    if (!isAdvanced || !confidence) return null;
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (confidence / 100) * circumference;
    
    let color = 'text-yellow-500';
    if (confidence >= 80) color = 'text-green-500';
    else if (confidence <= 30) color = 'text-red-500';
    
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle 
              cx="60" 
              cy="60" 
              r={radius} 
              stroke="#e6e6e6" 
              strokeWidth="8" 
              fill="none" 
            />
            <circle 
              cx="60" 
              cy="60" 
              r={radius} 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="none" 
              strokeLinecap="round" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`transform -rotate-90 origin-center ${color}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{confidence}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{candidate.candidate.name}</h2>
            <p className="text-indigo-100">{candidate.candidate.education}</p>
          </div>
          {isAdvanced && decision && (
            <div>
              {decision === 'yes' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                  Recommended
                </div>
              )}
              {decision === 'no' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
                  Not Recommended
                </div>
              )}
              {decision !== 'yes' && decision !== 'no' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-white">
                  Needs Review
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate Profile</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{candidate.candidate.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{candidate.candidate.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="font-medium">{candidate.candidate.education}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{candidate.candidate.years_of_experience} years</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {candidate.candidate.skills.split(',').map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Work Experience</p>
                <p className="mt-1">{candidate.candidate.experience}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Evaluation</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="whitespace-pre-line">{explanation}</p>
            </div>
          </div>
        </div>
        
        <div>
          {isAdvanced && confidence && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Confidence</h3>
              {getConfidenceCircle()}
            </div>
          )}
          
          {isAdvanced && candidate.lime_explanation && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Key Factors</h3>
              <div className="space-y-2">
                {candidate.lime_explanation.map((factor, index) => {
                  if (factor.error) return null;
                  
                  const isPositive = factor.supports_hiring;
                  return (
                    <div 
                      key={index} 
                      className={`bg-gray-50 rounded-lg p-3 border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm">{factor.feature}</p>
                        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{factor.importance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;