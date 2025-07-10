import React, { useState } from 'react';

const Upload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Upload Medical Documents
        </h1>
        <p className="text-xl text-gray-600 mt-4">
          Upload your medical reports for AI analysis
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-gray-600">
            <p className="mb-4">Drag and drop your files here</p>
            <p>or</p>
            <label className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              Browse Files
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Supported File Types
          </h2>
          <ul className="text-gray-600 list-disc list-inside">
            <li>PDF Documents</li>
            <li>Images (PNG, JPG, JPEG)</li>
            <li>Text Files (TXT)</li>
            <li>Microsoft Word Documents (DOCX)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Upload; 