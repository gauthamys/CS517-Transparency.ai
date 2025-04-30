import React, { useState } from 'react';

const CandidateDetails = ({ candidate, mode }) => {
  const [showHighlights, setShowHighlights] = useState(true);
  
  // For advanced mode, extract structured data
  const isAdvanced = mode === 'advanced';
  
  // Get the decision and confidence values
  const decision = isAdvanced ? candidate.evaluation.decision : null;
  const confidence = isAdvanced ? candidate.evaluation.confidence : null;
  
  // Get the original explanation
  const rawExplanation = isAdvanced ? candidate.evaluation.explanation : candidate.evaluation;
  
  // Get the phrase matches and relevance metrics (if available)
  const phraseMatches = isAdvanced ? 
    candidate.evaluation.phrase_matches : 
    candidate.phrase_matches;
    
  const relevanceMetrics = isAdvanced ?
    candidate.evaluation.relevance_metrics :
    null;
  
  // Use highlighted explanation if available and highlights are enabled
  const explanationToShow = phraseMatches && showHighlights ? 
    phraseMatches.highlighted_explanation_html : 
    rawExplanation;
  
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

  // Render the relevance metrics badge
  const getRelevanceBadge = () => {
    if (!relevanceMetrics) return null;
    
    const { relevance_ratio } = relevanceMetrics;
    
    let color = 'bg-yellow-100 text-yellow-800';
    if (relevance_ratio >= 20) color = 'bg-green-100 text-green-800';
    else if (relevance_ratio < 10) color = 'bg-red-100 text-red-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${color}`}>
        Relevance: {relevance_ratio}%
      </span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex justify-between items-center">
              <span>AI Evaluation</span>
              {phraseMatches && (
                <div className="flex items-center space-x-2">
                  {getRelevanceBadge()}
                  <button 
                    onClick={() => setShowHighlights(!showHighlights)}
                    className={`text-xs px-2 py-1 rounded ${showHighlights ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {showHighlights ? 'Hide Highlights' : 'Show Highlights'}
                  </button>
                </div>
              )}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {showHighlights && phraseMatches ? (
                <div dangerouslySetInnerHTML={{ __html: explanationToShow }} />
              ) : (
                <p className="whitespace-pre-line">{rawExplanation}</p>
              )}
              
              {relevanceMetrics && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Candidate attributes mentioned: {relevanceMetrics.matches_count}</span>
                    <span>Total words: {relevanceMetrics.total_words}</span>
                    <span className="font-medium">Relevance score: {relevanceMetrics.relevance_ratio}%</span>
                  </div>
                </div>
              )}
            </div>
            
            {phraseMatches && phraseMatches.matches && phraseMatches.matches.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Matches Found:</h4>
                <div className="bg-gray-50 rounded-lg p-3 overflow-auto max-h-40">
                  <table className="w-full text-xs">
                    <thead className="text-left">
                      <tr>
                        <th className="pb-2">Field</th>
                        <th className="pb-2">Keyword</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phraseMatches.matches.map((match, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="py-1 pr-4 text-gray-600">{match.field}</td>
                          <td className="py-1 font-medium">{match.keyword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
          
          {/* New section to display match statistics */}
          {phraseMatches && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Match Analysis</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {/* Match count gauge */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Matches Found</span>
                      <span className="font-medium">{phraseMatches.match_count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, phraseMatches.match_count * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Relevance gauge (if available) */}
                  {relevanceMetrics && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Relevance Ratio</span>
                        <span className="font-medium">{relevanceMetrics.relevance_ratio}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            relevanceMetrics.relevance_ratio >= 20 ? 'bg-green-500' : 
                            relevanceMetrics.relevance_ratio >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, relevanceMetrics.relevance_ratio * 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;