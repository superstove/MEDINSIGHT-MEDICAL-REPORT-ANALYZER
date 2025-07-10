import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Chat with MedInsight AI
        </h1>
        <p className="text-xl text-gray-600 mt-4">
          Get instant answers to your medical questions
        </p>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg">
          {/* Chat messages will go here */}
          <div className="text-center text-gray-500">
            Start a conversation with MedInsight AI
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat; 