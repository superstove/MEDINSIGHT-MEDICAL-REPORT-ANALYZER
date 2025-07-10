import { useState, useEffect, useRef, FormEvent } from "react";
import axios from "axios";
import {
  Stethoscope,
  AlertTriangle,
  X,
  CalendarCheck, // Booking icon
  MessageSquare, // Chat icon
  Send,        // Send icon
  Bot,         // Bot icon
  User,        // User icon
  Loader2,     // Loading spinner icon
  FileText,    // Generic file icon
} from "lucide-react";
import { Cardio } from "ldrs/react"; // Import Cardio animation
import "ldrs/react/Cardio.css"; // Import Cardio CSS
import Booking from "./Booking";

// Interface for chat messages
interface Message {
  sender: "user" | "bot";
  text: string;
}

interface AnalyzeProps {
  onBookSpecialist: (analysisData: {
    summary: string;
    diagnosis: string;
    key_findings: string[];
    urgent_concerns: string;
  }) => void;
}

function Analyze({ onBookSpecialist }: AnalyzeProps) {
  // State for analysis results
  const [summary, setSummary] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // State for chat panel
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null); // Keep chatError state for potential future use (e.g., banner)

  // Ref for scrolling chat messages
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const filePath = localStorage.getItem("filePath") || "";
  const backendUrl = "http://localhost:5000"; // Define backend URL

  const [showBooking, setShowBooking] = useState<boolean>(false);

  // --- Analysis Logic ---
  const fetchAnalysis = async () => {
    if (!filePath) {
      setAnalysisError("No file selected for analysis. Please go back and upload a file.");
      setLoadingAnalysis(false);
      return;
    }

    setLoadingAnalysis(true);
    setAnalysisError(null);
    setSummary(null); // Clear previous summary

    try {
      const filename = filePath.split(/[\\/]/).pop() || "unknown_file";
      const selectedLanguage = localStorage.getItem("selectedLanguage") || "English";
      console.log(`Fetching analysis for file: ${filename} (Path: ${filePath}) in ${selectedLanguage}`);

      const response = await axios.post(`${backendUrl}/analyze`, {
        file_path: filePath,
        filename: filename,
        language: selectedLanguage
      }, { withCredentials: true });

      console.log("Analysis API Response:", response.data);

      if (response.data.error) {
        if (response.data.error.includes("not found")) {
          setAnalysisError(`Analysis Error: The file '${filename}' was not found on the server. It might have been moved or deleted.`);
        } else {
          setAnalysisError(`Analysis Error: ${response.data.error}`);
        }
        setSummary(null);
      } else {
        setSummary(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching analysis:", err);
      const errorMsg = err.response?.data?.error || err.message || "Unknown error";
      setAnalysisError(`Failed to load analysis. ${errorMsg}. Is the backend running at ${backendUrl}?`);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // --- Booking Logic ---
  const handleBooking = () => {
    setShowBooking(true);
  };

  const handleCloseBooking = () => {
    setShowBooking(false);
  };

  // --- Trigger Analysis on Load ---
  useEffect(() => {
    if (filePath) {
        fetchAnalysis();
    } else {
        setAnalysisError("No file selected. Please go back and upload a medical report.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  // --- Chat Logic ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isChatLoading) return;

    const newUserMessage: Message = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsChatLoading(true);
    setChatError(null); // Clear previous chat error

    try {
      console.log("Sending message to chat API:", trimmedInput);
      const response = await axios.post(`${backendUrl}/api/chat`,
        { message: trimmedInput },
        { withCredentials: true }
      );

      console.log("Chat API Response:", response.data);

      if (response.data.error) {
          let errMsg = response.data.error;
          if (response.data.safety_ratings) {
              errMsg += ` (Safety concern detected)`;
          }
          throw new Error(errMsg);
      }

      const botResponse: Message = { sender: "bot", text: response.data.response };
      setMessages((prev) => [...prev, botResponse]);

    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMsg = err.message || "Unknown chat error";
      // Display error in chat for user feedback
      setMessages((prev) => [...prev, { sender: 'bot', text: `⚠️ Sorry, I encountered an error: ${errorMsg}` }]);
      // Set chatError state if you need it elsewhere
      // setChatError(`Chat Error: ${errorMsg}.`);
    } finally {
      setIsChatLoading(false);
      setTimeout(scrollToBottom, 100); // Ensure scroll after DOM updates
    }
  };

  // --- Component Render ---
  return (
    // Main container - takes full screen height, relative for fixed children positioning
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">

      {showBooking && (
        <Booking 
          onClose={handleCloseBooking}
          analysisData={{
            summary: summary?.summary,
            diagnosis: summary?.diagnosis,
            key_findings: summary?.key_findings,
            urgent_concerns: summary?.urgent_concerns
          }}
        />
      )}

      {/* Main Content Area (Analysis Results) */}
      {/* REMOVED the conditional margin-right. The chat panel will overlay this. */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        {/* Analysis Loading State */}
        {loadingAnalysis && (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <Cardio size="80" stroke="5" speed="1.8" color="#2563EB" />
            <p className="mt-6 text-xl text-gray-600 font-semibold animate-pulse">Analyzing your report...</p>
          </div>
        )}

        {/* Analysis Error State */}
        {analysisError && !loadingAnalysis && (
          <div className="flex flex-col items-center justify-center h-[80vh] p-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-lg text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
                <p>{analysisError}</p>
                {filePath &&
                  <button
                    onClick={fetchAnalysis}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Retry Analysis
                  </button>
                }
            </div>
          </div>
        )}

        {/* Analysis Success State (Render Summary) */}
        {summary && !loadingAnalysis && !analysisError && (
          // Center content within the available space, max width for readability
          <div className="max-w-5xl mx-auto space-y-5 md:space-y-6">
             {/* Header with Actions */}
             <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center border-b">
                 <h1 className="text-2xl font-bold text-gray-900">Medical Report Analysis</h1>
                 <div className="flex gap-2">
                     <button
                         onClick={() => window.location.href = '/upload'}
                         className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                         title="Upload a new file"
                     >
                         <FileText size={16} className="mr-1" />
                         Upload New File
                     </button>
                     <button
                         onClick={handleBooking}
                         className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                         title="Book a specialist"
                     >
                         <CalendarCheck size={16} className="mr-1" />
                         Book Specialist
                     </button>
                     <button
                         onClick={() => setIsChatOpen(!isChatOpen)}
                         className="flex items-center px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                         title="Toggle chat panel"
                     >
                         <MessageSquare size={16} className="mr-1" />
                         {isChatOpen ? "Close Chat" : "Open Chat"}
                     </button>
                 </div>
             </div>

            {/* Dynamic Fields Rendering */}
            {Object.entries(summary).map(([key, value]) => {
              const isEmpty = value === null || value === "" || (Array.isArray(value) && value.length === 0);
              if (isEmpty) return null;

              const title = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              let borderColor = 'border-gray-400';
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('urgent') || lowerKey.includes('alert') || lowerKey.includes('critical')) borderColor = 'border-red-500';
              else if (lowerKey.includes('diagnosis')) borderColor = 'border-blue-500';
              else if (lowerKey.includes('finding')) borderColor = 'border-green-500';
              else if (lowerKey.includes('recommendation') || lowerKey.includes('plan') || lowerKey.includes('next_step')) borderColor = 'border-purple-500';
              else if (lowerKey.includes('summary')) borderColor = 'border-yellow-500';

              return (
                <div key={key} className={`bg-white shadow-md rounded-lg p-4 border-l-4 ${borderColor}`}>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{title}</h2>
                  {Array.isArray(value) ? (
                    <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2">
                      {value.map((item: any, index: number) => (
                        <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Book Specialist Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => onBookSpecialist({
                  summary: summary.summary,
                  diagnosis: summary.diagnosis,
                  key_findings: summary.key_findings,
                  urgent_concerns: summary.urgent_concerns
                })}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Book a Specialist
              </button>
            </div>
          </div>
        )}

         {/* Initial State / Data not available */}
         {filePath && !summary && !loadingAnalysis && !analysisError && (
             <div className="flex flex-col items-center justify-center h-[80vh]">
                 <FileText className="h-16 w-16 text-gray-400 mb-4"/>
                 <p className="text-lg text-gray-500">Analysis data not yet available.</p>
             </div>
         )}

      </main>

      {/* Chatbot Icon Button (Fixed Position) */}
      <button
        onClick={() => setIsChatOpen(true)}
        // Hide button when chat is already open for cleaner look
        className={`fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-opacity duration-300 z-[60] ${isChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open Chat"
        aria-hidden={isChatOpen} // Hide from accessibility tree when chat is open
      >
        <MessageSquare className="h-7 w-7" />
      </button>

      {/* Chat Side Panel (Fixed Position, Slides In/Out) */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 lg:w-[450px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200
                    ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" // Changed role to dialog as it's an interactive overlay
        aria-modal="true" // Indicate it's modal when open
        aria-label="AI Medical Assistant Chat Panel"
        hidden={!isChatOpen} // Use hidden attribute for better accessibility support
      >
        {/* Chat Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">AI Medical Assistant</h2>
          </div>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
            aria-label="Close Chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-100">
           {messages.length === 0 && !isChatLoading && (
             <div className="text-center text-sm text-gray-500 p-4">
               Ask a question about the analyzed report or general medical topics.
             </div>
           )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                 <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white ${msg.sender === 'user' ? 'bg-blue-500 ml-2' : 'bg-indigo-500 mr-2'}`}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                 </div>
                <div
                  className={`px-3 py-2 rounded-xl shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex justify-start mt-2">
               <div className="flex items-start max-w-[80%]">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-white bg-indigo-500 mr-2"> <Bot size={16}/> </div>
                  <div className="px-4 py-2 rounded-xl shadow-sm bg-white text-gray-800">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  </div>
               </div>
            </div>
          )}

          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isChatLoading ? "Waiting for response..." : "Ask a question..."}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-100"
              disabled={isChatLoading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150"
              disabled={isChatLoading || !userInput.trim()}
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div> {/* End Chat Panel */}

    </div> // End Main Container
  );
}

export default Analyze;