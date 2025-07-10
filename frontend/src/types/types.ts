export interface ApiResponse {
    status: string;
    data: {
      user: { id: string; name: string; email: string };
      reports: { id: string; title: string; date: string; summary: string }[];
      recommendations: string[];
    };
  }
  
  export interface ChatMessage {
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
  }
  
  export interface Notification {
    id: number;  // Convert from string to number
    title: string;
    message: string;
    time: string;
    read: boolean;
  }
  
  
  
  export type Report = {
    id: string;
    name: string;
    date: string;
    status: "Normal" | "Warning" | "Alert"; // Add "Alert" here
    type: string;
  };
  
  
  