// User related interfaces
export interface ContactInfo {
  phone: string;
  address: string;
  emergencyContact: string;
}

export interface PersonalInfo {
  dateOfBirth: string;
  age: number;
  gender: string;
  bloodType: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  contactInfo: ContactInfo;
  personalInfo: PersonalInfo;
}

// Report related interfaces
export interface Report {
  id: string;
  name: string;
  date: string;
  status: 'Normal' | 'Alert' | 'Requires Consultation';
  type: string;
}

export interface ReportDetail {
  id: string;
  title: string;
  date: string;
  summary: string;
}

// Notification related interfaces
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Chat related interfaces
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// API response interfaces
export interface ApiResponse {
  status: string;
  data: ApiData;
}

export interface ApiData {
  user: User;
  reports: ReportDetail[];
  recommendations: string[];
}

// Component props interfaces
export interface UploadAreaProps {
  type: 'documents' | 'images' | 'camera';
}

// Theme related interfaces
export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Language related interfaces
export interface LanguageOption {
  code: string;
  name: string;
}