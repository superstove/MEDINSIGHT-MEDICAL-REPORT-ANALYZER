import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { FileText } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  disease: string;
  summary: string;
  createdAt: {
    toDate: () => Date;
  };
}

const History: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Please sign in to view your reports');
          setLoading(false);
          return;
        }

        // Here you would typically fetch reports from your backend
        // For now, we'll just simulate loading
        setLoading(false);
        setReports([]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Medical History</h1>
        <p className="text-xl text-gray-600 mt-4">
          View your past medical reports and analyses
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 transition duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.disease || 'Unknown Disease'}
                    </h3>
                    <p className="text-gray-600 mt-1">{report.title}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Analyzed on {report.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    View Details
                  </button>
                </div>
                {report.summary && (
                  <p className="mt-4 text-gray-600 text-sm border-t pt-4">
                    {report.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History; 