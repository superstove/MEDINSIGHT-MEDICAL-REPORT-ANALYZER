import React, { useState, useEffect, useMemo, useRef } from 'react';
import Analyze from "./Analyze"; // Import Analyze.tsx
import Account from './Account';
import {
  Bell, Bot, X, FileUp, Settings, HelpCircle, History,
  User, Sun, Moon, Brain, FileImage, FileText, Activity,
  Globe2, ChevronDown, UserCircle, Camera, Send, Paperclip,
  Image, Mic, Smile, Clock, Calendar, ArrowRight
} from 'lucide-react';
import { 
  Report, 
  Notification, 
  ChatMessage, 
  ApiResponse,
  ContactInfo,
  PersonalInfo,
  LanguageOption
} from './types';
import Booking from './Booking';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [activeUploadTab, setActiveUploadTab] = useState<'files' | 'camera'>('files');
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I'm your medical assistant. How can I help you today?", timestamp: new Date() }
  ]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [fileType, setFileType] = useState<'documents' | 'images'>('documents');
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false); // State for camera modal
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingAnalysisData, setBookingAnalysisData] = useState({
    summary: '',
    diagnosis: '',
    key_findings: [] as string[],
    urgent_concerns: ''
  });
  const [user, setUser] = useState<any>(null);

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
    role: 'Patient',
    contactInfo: {
      phone: '+1 234 567 8900',
      address: '123 Medical Center St, Healthcare City',
      emergencyContact: '+1 234 567 8901'
    },
    personalInfo: {
      dateOfBirth: '1990-01-01',
      age: 33,
      gender: 'Male',
      bloodType: 'O+'
    }
  } as const;

  // Function to start speech recognition
  const startListening = () => {
    if (typeof window.SpeechRecognition === 'function' || typeof window.webkitSpeechRecognition === 'function') {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: { results: { transcript: any; }[][]; }) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript); // Update message with the recognized transcript
        sendMessage(); // Send the message immediately after recognition
      };

      recognition.onerror = (event: { error: any; }) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false); // Update state once recognition ends
      };

      setIsListening(true);
      recognition.start(); // Start recognition
    } else {
      alert('Speech recognition not supported in your browser.');
    }
  };
  
  // Define notifications and reports as state variables
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Report Analysis',
      message: 'Your blood test results have been analyzed.',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      title: 'Appointment Reminder',
      message: 'You have an appointment with Dr. Johnson tomorrow at 10:00 AM.',
      time: '1 day ago',
      read: true
    },
    {
      id: '3',
      title: 'New Feature Available',
      message: 'Try our new AI-powered report comparison tool.',
      time: '3 days ago',
      read: true
    }
  ]);

  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Blood Test Results',
      date: '2024-03-15',
      status: 'Normal',
      type: 'Blood Work'
    },
    {
      id: '2',
      name: 'Cardiac Assessment',
      date: '2024-03-10',
      status: 'Alert',
      type: 'Cardiology'
    }
  ]);

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' }
  ];

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to conversation
    setConversation((prev) => [
      ...prev,
      { role: "user", content: message, timestamp: new Date() },
    ]);

    // Clear the input
    setMessage("");

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send user message to backend
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the assistant");
      }

      const data = await response.json();

      // Add assistant's response to conversation
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.response, timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Error:", error);
      // In case of an error, you can add a fallback message
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again.", timestamp: new Date() },
      ]);
    } finally {
      // Hide typing indicator
      setIsTyping(false);
    }
  };

  useEffect(() => {
    // Instead of trying to fetch from a non-existent API, we'll use mock data directly
    setApiData({
      status: "success",
      data: {
        user: mockUser,
        reports: [
          {
            id: "report1",
            title: "Blood Test Analysis",
            date: "2024-03-15",
            summary: "All values within normal range"
          },
          {
            id: "report2",
            title: "Cardiac Assessment",
            date: "2024-03-10",
            summary: "Minor irregularities detected, follow-up recommended"
          }
        ],
        recommendations: [
          "Maintain regular exercise routine",
          "Follow up with cardiologist in 3 months",
          "Continue current medication regimen"
        ]
      }
    });
  }, []);

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please make sure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
        stopCamera();
        setCameraOpen(false);  // Close the camera modal after capturing
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Calculate unread notifications count dynamically
  const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const FilesUploadArea = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'hi', name: 'Hindi' },
      { code: 'es', name: 'Spanish' }
    ];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];
        setSelectedFile(file);
        uploadFile(file);
      }
    };
  
    const uploadFile = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          const data = await response.json();
          setUploaded(true);
          localStorage.setItem("filePath", data.file_path);
        } else {
          console.error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };
  
    const handleAnalyzeClick = () => {
      localStorage.setItem("selectedLanguage", selectedLanguage);
      setShowAnalysis(true);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (event.target && languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
          setIsLanguageDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
      <div className="mt-8">
        <div className={`border-2 border-dashed ${
          isDarkMode ? 'border-gray-600' : 'border-gray-300'
        } rounded-lg p-8 text-center`}>
          {!uploaded ? (
            <>
              <input
                type="file"
                id="fileUpload"
                className="hidden"
                accept=".pdf,.xlsx,.docx, .png, .jpg, .jpeg"
                onChange={handleFileChange}
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition text-lg font-medium"
              >
                Choose File
              </label>
              <p className={`text-base mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Supported formats: PDF, XLSX, DOCX, PNG, JPG, JPEG
              </p>
            </>
          ) : (
            <div className="text-center">
              <p className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                File uploaded successfully!
              </p>
              <div className="mt-6 flex justify-center items-center space-x-4">
                <div className="relative" ref={languageDropdownRef}>
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className={`px-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } rounded-lg transition flex items-center space-x-2`}
                  >
                    <Globe2 className="h-4 w-4" />
                    <span>{selectedLanguage}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isLanguageDropdownOpen && (
                    <div className={`absolute left-0 mt-1 w-48 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-lg shadow-lg z-50`}>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.name);
                            setIsLanguageDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 ${
                            isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAnalyzeClick}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition"
                >
                  Analyze
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  





  

  const CameraUploadArea = () => {
    return (
      <div className={`mt-6 border-2 border-dashed ${
        isDarkMode ? 'border-gray-600' : 'border-gray-300'
      } rounded-lg p-6`}>
        {!capturedImage && (
          <div className="text-center">
            <Camera className={`mx-auto h-12 w-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Take a photo of your medical document or condition
            </p>
            <button 
              onClick={() => setCameraOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Start Camera
            </button>
          </div>
        )}
        
        {capturedImage && (
          <div className="text-center">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-lg">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-auto"
              />
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button 
                onClick={() => {
                  alert("Image would be uploaded to the server for analysis");
                  setCapturedImage(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Use Photo
              </button>
              <button 
                onClick={retakePhoto}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retake
              </button>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  };

  // Update CameraModal with dark mode
  const CameraModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-4 max-w-md w-full`}>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto"
          />
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button 
            onClick={captureImage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Capture
          </button>
          <button 
            onClick={() => {
              setCameraOpen(false);
              stopCamera();
            }}
            className={`px-4 py-2 ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'
            } text-white rounded-lg`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Format timestamp for chat messages
  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (isAccountOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  
    // Cleanup function
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isAccountOpen]);

  const handleBookSpecialist = (analysisData: any) => {
    setBookingAnalysisData(analysisData);
    setIsBookingOpen(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className={`h-8 w-8 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              MedInsight
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             {/* Notifications */}
             <div className="relative">
              <button
                onClick={() => setNotificationOpen(!isNotificationOpen)}
                className={`p-2 rounded-lg relative ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Bell className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              
              {isNotificationOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } ring-1 ring-black ring-opacity-5 z-50`}>
                  <div className="p-4 border-b border-gray-200">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 ${
                            notification.read 
                              ? '' 
                              : isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'
                          } ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          } border-b border-gray-200`}
                        >
                          <div className="flex justify-between">
                            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </h4>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {notification.time}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No notifications yet
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setNotifications(prev => 
                          prev.map(notification => ({ ...notification, read: true }))
                        );
                      }}
                      className={`text-sm ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} hover:underline`}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-yellow-400" />
              ) : (
                <Moon className="h-6 w-6 text-gray-600" />
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`flex items-center space-x-2 p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <UserCircle className={`h-6 w-6 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
              <span className={isDarkMode ? 'text-white' : 'text-gray-600'}>
                {user?.displayName || 'User'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[85%] mx-auto px-4 py-12">
        <div className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-12 min-h-[70vh]`}>
          {showAnalysis ? (
            <Analyze onBookSpecialist={handleBookSpecialist} />
          ) : (
            <>
              <h2 className={`text-4xl font-bold text-center mb-10 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Upload Medical Reports
              </h2>
              
              {/* Upload Tabs */}
              <div className={`mt-10 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex space-x-12">
                  <button
                    onClick={() => {
                      setActiveUploadTab('files');
                      if (!showAnalysis) {
                        setUploaded(false);
                        setSelectedFile(null);
                      }
                    }}
                    className={`pb-4 relative text-lg ${
                      activeUploadTab === 'files'
                        ? `${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`
                        : `${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FileUp className="h-6 w-6" />
                      <span>Upload Files</span>
                    </div>
                    {activeUploadTab === 'files' && (
                      <div className={`absolute bottom-0 left-0 w-full h-0.5 ${
                        isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'
                      }`} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveUploadTab('camera');
                      if (!showAnalysis) {
                        setUploaded(false);
                        setSelectedFile(null);
                      }
                    }}
                    className={`pb-4 relative text-lg ${
                      activeUploadTab === 'camera'
                        ? `${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`
                        : `${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Camera className="h-6 w-6" />
                      <span>Take Photo</span>
                    </div>
                    {activeUploadTab === 'camera' && (
                      <div className={`absolute bottom-0 left-0 w-full h-0.5 ${
                        isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'
                      }`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Upload Areas */}
              <div className="mt-10">
                {activeUploadTab === 'files' ? (
                  <FilesUploadArea />
                ) : (
                  <CameraUploadArea />
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-auto py-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-inner`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                About
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Team
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Connect
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2024 MedInsight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-64 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg transform ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-200 ease-in-out z-30`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Profile
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-gray-600'}`} />
            </button>
          </div>
          
          {/* Profile Section */}
          <div className="mb-8 text-center">
            <UserCircle className={`h-20 w-20 mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <h3 className={`mt-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {user?.displayName || 'User'}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {user?.email || ''}
            </p>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setIsAccountOpen(true)} 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <User className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Account</span>
            </button>
            <button className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <History className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>History</span>
            </button>
            <button className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <Settings className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Settings</span>
            </button>
            <button className={`flex items-center space-x-3 w-full p-3 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}>
              <HelpCircle className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Help</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Overlay for notifications */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotificationOpen(false)}
        />
      )}

      {/* Modal for camera */}
      {isCameraOpen && <CameraModal />}

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-lg w-full max-w-4xl overflow-hidden max-h-[90vh] overflow-y-auto`}>
            <Booking 
              onClose={() => setIsBookingOpen(false)}
              analysisData={bookingAnalysisData}
            />
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAccountOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-4xl overflow-hidden`}>
            <Account onClose={() => setIsAccountOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;