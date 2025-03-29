
# Flame Guard: CNN-Based Wildfire Detection

Advanced AI-powered wildfire detection system using convolutional neural networks.

## Project Structure

This project consists of two main components:

1. **Frontend**: React application with Tailwind CSS and Shadcn UI components
2. **Backend**: Flask API with YOLOv8 ML model for fire detection

## Prerequisites

Before running the project, make sure you have:

- Python 3.8+ installed
- Node.js and npm installed
- MySQL Server installed and running
- YOLOv8 model file (`best.pt`) in the root directory

## Database Setup

You need to create two MySQL databases:

```sql
CREATE DATABASE fire_detection_db;
CREATE DATABASE fire_detection_vod;

USE fire_detection_db;
CREATE TABLE fire_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  confidence FLOAT NOT NULL,
  image_path VARCHAR(255) NOT NULL
);

USE fire_detection_vod;
CREATE TABLE video_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  video_path VARCHAR(255) NOT NULL,
  csv_path VARCHAR(255) NOT NULL
);
```

## Installation

### Backend Setup

1. Create a Python virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install the required Python packages:
   ```
   pip install flask flask-cors flask-mail python-dotenv opencv-python torch ultralytics cvzone mysql-connector-python Werkzeug
   ```

4. Make sure the `.env` file is in the root directory with your configuration.

5. Run the Flask backend:
   ```
   python app_with_cors.py
   ```

### Frontend Setup

1. Navigate to the project directory and install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Access the application at `http://localhost:5173` (or whatever port is shown in your terminal).
2. Use the sidebar to navigate between:
   - Home (Dashboard)
   - Realtime Alert (webcam monitoring)
   - Video Alert (video file processing)
   - Historical Logs (past detections)
   - Contact (for support)

## Features

- **Realtime Alert**: Monitor webcam feed for fire detection in real-time
- **Video Alert**: Upload and process video files for fire detection
- **Historical Logs**: View past fire detections and processed videos
- **Email Alerts**: Automatic email notifications when fires are detected
- **Database Storage**: All detections are logged to MySQL databases

## Environment Variables

The `.env` file contains configuration for:

- Email settings (SMTP server, credentials)
- MySQL database connection
- Alert recipient email addresses
- Model paths and thresholds
- Server configuration

## Troubleshooting

- Make sure your MySQL server is running
- Verify the `.env` file has the correct database credentials
- Check that the YOLOv8 model file (`best.pt`) is present
- Ensure all required Python packages are installed
- Check port availability (5000 for backend, 5173 for frontend)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
