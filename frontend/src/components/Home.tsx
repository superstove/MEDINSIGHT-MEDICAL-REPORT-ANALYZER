import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MedInsight
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal medical assistant powered by AI
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Reports</h2>
          <p className="text-gray-600">
            Upload your medical reports and get instant AI-powered analysis
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat with AI</h2>
          <p className="text-gray-600">
            Get answers to your medical questions from our advanced AI assistant
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Track History</h2>
          <p className="text-gray-600">
            Keep track of your medical history and previous analyses
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 