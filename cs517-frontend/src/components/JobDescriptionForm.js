import React from 'react';

const JobDescriptionForm = ({ jobDescription, setJobDescription, onSubmit, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Job Description</h2>
      <p className="text-gray-600 mb-4">
        Enter the job description below to find the best candidates from your pool.
      </p>
      <div className="mb-4">
        <textarea
          className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="6"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Enter job description here..."
          disabled={loading}
        ></textarea>
      </div>
      <button
        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex justify-center items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Find Matching Candidates'
        )}
      </button>
      
      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Example Job Descriptions:</h3>
        <div className="space-y-2">
          <button
            className="text-sm text-indigo-600 hover:text-indigo-800 block"
            onClick={() => setJobDescription("We are looking for a Senior Frontend Developer with 5+ years of experience in React. The ideal candidate should have strong knowledge of JavaScript, HTML5, and CSS3. Experience with Redux, TypeScript, and responsive design is required.")}
          >
            ➤ Senior Frontend Developer
          </button>
          <button
            className="text-sm text-indigo-600 hover:text-indigo-800 block"
            onClick={() => setJobDescription("Seeking a Data Scientist with expertise in machine learning algorithms, data visualization, and statistical analysis. Must be proficient in Python, R, and SQL. Experience with TensorFlow or PyTorch is a plus. PhD in Computer Science, Statistics, or related field preferred.")}
          >
            ➤ Data Scientist
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionForm;