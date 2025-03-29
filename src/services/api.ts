
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000";

// Helper function to handle API errors
const handleApiError = (error: any, customMessage?: string) => {
  console.error("API Error:", error);
  toast.error(customMessage || "An error occurred while communicating with the server");
  throw error;
};

// Realtime Alert APIs
export const startWebcam = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/start_webcam`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to start webcam. Is the backend server running?");
  }
};

export const stopWebcam = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stop_webcam`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to stop webcam");
  }
};

export const getRealtimeVideoFeed = () => {
  return `${API_BASE_URL}/realtime_video_feed`;
};

// Video Alert APIs
export const uploadVideo = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload_vod`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to upload video. Is the backend server running?");
  }
};

export const getVodVideoFeed = () => {
  return `${API_BASE_URL}/vod_video_feed`;
};

export const downloadProcessedVideo = () => {
  return `${API_BASE_URL}/download_processed_video`;
};

export const downloadDetectionLog = () => {
  return `${API_BASE_URL}/download_detection_log`;
};

// Historical Logs APIs
export const getFireLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_fire_logs`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to fetch fire logs. Is the backend server running?");
  }
};

export const getVideoLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/get_video_logs`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to fetch video logs. Is the backend server running?");
  }
};

export const getImageUrl = (imagePath: string) => {
  // Extract only the filename from the path
  const filename = imagePath.split('/').pop();
  return `${API_BASE_URL}/images/${filename}`;
};

export const downloadPastVideo = (videoPath: string) => {
  return `${API_BASE_URL}/download_past_video/${videoPath}`;
};

export const downloadPastLog = (csvPath: string) => {
  return `${API_BASE_URL}/download_past_log/${csvPath}`;
};
