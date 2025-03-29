
import os
import cv2
import time
import torch
import csv
import mysql.connector
from datetime import datetime
from flask import Flask, render_template, Response, request, jsonify, redirect, url_for, send_file, send_from_directory
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from ultralytics import YOLO
import cvzone
import math
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes to allow frontend to make requests
CORS(app)

# Flask-Mail Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# Configuration for Video Upload and Processing
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
PROCESSED_FOLDER = os.getenv('PROCESSED_FOLDER', 'processed_videos')
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.25))

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Database connection settings
db_config_realtime = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

db_config_vod = {
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME_VOD')
}

# Check if CUDA is available and use GPU if possible
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"[INFO] Using device: {device}")

# YOLOv8 Model Paths
realtime_model_path = os.getenv('REALTIME_MODEL_PATH', "best.pt")
vod_model_path = os.getenv('VOD_MODEL_PATH', "best.pt")

# Load Models
realtime_model = YOLO(realtime_model_path).to(device)
vod_model = YOLO(vod_model_path)

# Webcam settings
frame_width = 640
frame_height = 480
fps_limit = 15
frame_skip = 1
frame_count = 0

# Webcam control
video_capture = None
webcam_running = False
 
# Fire image folder path
fire_image_folder = os.getenv('FIRE_IMAGE_FOLDER', "fire_detect_img")
os.makedirs(fire_image_folder, exist_ok=True)

# Screenshot and email settings
last_screenshot_time = 0
screenshot_delay = 30
last_email_time = 0
email_cooldown = 300

# Video on Demand global variables
uploaded_video_path = None
processed_video_path = None
detection_log_path = None

# Class names for VOD
classNames = ['fire', 'smoke', 'other']

def allowed_file(filename):
    """Check if the uploaded file has a valid extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_fire_screenshot(frame):
    """Save a screenshot if fire is detected with confidence > 0.8."""
    global last_screenshot_time
    current_time = time.time()

    if current_time - last_screenshot_time >= screenshot_delay:
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"fire_{timestamp}.jpg"
        filepath = os.path.join(fire_image_folder, filename)
        cv2.imwrite(filepath, frame)
        last_screenshot_time = current_time
        print(f"[INFO] Fire screenshot saved: {filepath}")
        return filepath
    return None

def send_fire_alert(image_path):
    """Send an email alert when fire is detected."""
    global last_email_time
    current_time = time.time()

    if current_time - last_email_time >= email_cooldown:
        with app.app_context():
            recipients = os.getenv('ALERT_EMAILS', '').split(',')
            subject = "🔥 Fire Alert Detected"
            message_body = "Fire detected! Check the attached screenshot.\n" \
                           "Longitude: 73.760120\n" \
                           "Latitude: 18.645974"

            for recipient in recipients:
                if recipient.strip():
                    msg = Message(subject=subject, 
                                  sender=app.config['MAIL_DEFAULT_SENDER'], 
                                  recipients=[recipient.strip()])
                    msg.body = message_body

                    if image_path and os.path.exists(image_path):
                        try:
                            with open(image_path, 'rb') as img:
                                msg.attach(
                                    filename=os.path.basename(image_path),
                                    content_type='image/png' if image_path.endswith('.png') else 'image/jpeg',
                                    data=img.read()
                                )
                            mail.send(msg)
                            print(f"[INFO] Email alert sent successfully to {recipient.strip()}")
                        except Exception as e:
                            print(f"[ERROR] Failed to attach or send email to {recipient.strip()}: {e}")

            last_email_time = current_time
    else:
        print(f"[INFO] Email not sent. Cooldown period not over. Time left: {int(email_cooldown - (current_time - last_email_time))} seconds")

def store_fire_data(confidence, image_path):
    """Store fire detection log in MySQL."""
    try:
        conn = mysql.connector.connect(**db_config_realtime)
        cursor = conn.cursor()
        query = """
            INSERT INTO fire_logs (timestamp, confidence, image_path)
            VALUES (%s, %s, %s)
        """
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute(query, (timestamp, confidence, image_path))
        conn.commit()
        cursor.close()
        conn.close()
        print("[INFO] Fire log stored successfully in MySQL.")
    except mysql.connector.Error as e:
        print(f"[ERROR] Failed to store fire log in MySQL: {e}")

def generate_realtime_frames():
    """Generate frames from the webcam with YOLOv8 inference."""
    global frame_count, video_capture, webcam_running
    prev_time = 0

    while webcam_running and video_capture.isOpened():
        success, frame = video_capture.read()
        if not success:
            break

        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        # Limit FPS to prevent high CPU/GPU usage
        curr_time = time.time()
        if curr_time - prev_time < 1.0 / fps_limit:
            continue
        prev_time = curr_time

        # Run YOLOv8 inference on the frame
        results = realtime_model(frame, conf=0.25, iou=0.5, device=device)

        fire_detected = False
        high_confidence_image_path = None

        # Draw bounding boxes for detections
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                conf = float(box.conf[0])
                label = result.names[int(box.cls[0])]

                # Draw bounding box if fire is detected
                if label == "fire" and conf > 0.25:
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                    cv2.putText(frame, f'{label} {conf:.2f}', (int(x1), int(y1) - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

                    # If confidence > 0.8, save a screenshot and prepare to send an alert
                    if conf > 0.9:
                        high_confidence_image_path = save_fire_screenshot(frame)
                        fire_detected = True

        # Send an email alert if high confidence fire is detected
        if fire_detected and high_confidence_image_path:
            send_fire_alert(high_confidence_image_path)
            store_fire_data(conf, high_confidence_image_path)

        # Encode the frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    # Release webcam when stopping
    if video_capture and video_capture.isOpened():
        video_capture.release()

def save_to_database_vod(video_path, csv_path):
    """Insert video and CSV log paths into the MySQL database for VOD."""
    try:
        conn = mysql.connector.connect(**db_config_vod)
        cursor = conn.cursor()

        query = """
        INSERT INTO video_logs (timestamp, video_path, csv_path)
        VALUES (%s, %s, %s)
        """
        data = (datetime.now(), video_path, csv_path)
        cursor.execute(query, data)
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ Data successfully inserted into the database!")
    except Exception as e:
        print(f"❌ Database insertion error: {e}")

def generate_vod_frames(video_path, output_path, log_path):
    """Process the uploaded video and generate frames with detections, saving the output."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Cannot open video source.")
        return

    frame_number = 0
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    fps = int(cap.get(5))

    # Create VideoWriter to save processed video
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

    # Create CSV file and write header
    with open(log_path, mode='w', newline='') as csv_file:
        fieldnames = ['Frame_Number', 'Timestamp', 'Class', 'Confidence']
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        while True:
            success, img = cap.read()
            if not success:
                print("Video processing completed or input error.")
                break

            frame_number += 1
            timestamp = frame_number / fps

            # Run YOLO model on the frame
            results = vod_model(img, stream=True)
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    conf = math.ceil((box.conf[0] * 100)) / 100
                    cls = int(box.cls[0])
                    currentClass = classNames[cls]

                    if conf >= CONFIDENCE_THRESHOLD:
                        if currentClass == 'fire':
                            myColor = (0, 0, 255)
                        elif currentClass == 'smoke':
                            myColor = (255, 165, 0)
                        else:
                            myColor = (0, 255, 0)

                        # Draw bounding box and label
                        cv2.rectangle(img, (x1, y1), (x2, y2), myColor, 3)
                        cvzone.putTextRect(img, f'{currentClass} {conf}', (max(0, x1), max(35, y1)),
                                           scale=1, thickness=2, colorB=myColor,
                                           colorT=(255, 255, 255), colorR=myColor, offset=5)

                        # Write to CSV Log
                        writer.writerow({
                            'Frame_Number': frame_number,
                            'Timestamp': round(timestamp, 2),
                            'Class': currentClass,
                            'Confidence': conf
                        })

            # Write the processed frame to the output video
            out.write(img)
            ret, buffer = cv2.imencode('.jpg', img)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()
    out.release()
    save_to_database_vod(output_path, log_path)

# Routes for Realtime Detection
@app.route('/')
def index():
    """Render the index page with options for realtime and video on demand detection."""
    return render_template('index.html')

@app.route('/realtime_video_feed')
def realtime_video_feed():
    """Return the realtime video feed."""
    return Response(generate_realtime_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_webcam', methods=['POST'])
def start_webcam():
    """Start the webcam for realtime detection."""
    global video_capture, webcam_running
    if not webcam_running:
        video_capture = cv2.VideoCapture(0)
        video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, frame_width)
        video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, frame_height)
        webcam_running = True
        return jsonify({'status': 'Webcam started successfully'})
    return jsonify({'status': 'Webcam already running'})

@app.route('/stop_webcam', methods=['POST'])
def stop_webcam():
    """Stop the webcam for realtime detection."""
    global webcam_running, video_capture
    if webcam_running:
        webcam_running = False
        if video_capture and video_capture.isOpened():
            video_capture.release()
        return jsonify({'status': 'Webcam stopped successfully'})
    return jsonify({'status': 'Webcam is not running'})

@app.route('/get_fire_logs', methods=['GET'])
def get_fire_logs():
    """Retrieve historical fire detection logs from MySQL."""
    try:
        conn = mysql.connector.connect(**db_config_realtime)
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM fire_logs ORDER BY timestamp DESC"
        cursor.execute(query)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Fix Windows path issue
        for log in logs:
            log['image_path'] = log['image_path'].replace('\\', '/')
        
        return jsonify({'logs': logs})
    except mysql.connector.Error as e:
        print(f"[ERROR] Failed to retrieve fire logs: {e}")
        return jsonify({'error': 'Failed to fetch logs'}), 500

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve fire detection images."""
    return send_from_directory(fire_image_folder, filename)

# Routes for Video on Demand
@app.route('/upload_vod', methods=['POST'])
def upload_file():
    """Handle file upload and save the video for VOD processing."""
    global uploaded_video_path, processed_video_path, detection_log_path
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        uploaded_video_path = os.path.join(UPLOAD_FOLDER, filename)
        processed_video_path = os.path.join(PROCESSED_FOLDER, f"processed_{filename}")
        detection_log_path = os.path.join(PROCESSED_FOLDER, f"detection_log_{filename.replace('.mp4', '.csv')}")

        file.save(uploaded_video_path)
        print(f"Video uploaded: {uploaded_video_path}")
        return jsonify({'status': 'success', 'message': 'File uploaded successfully'})

    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/vod_video_feed')
def vod_video_feed():
    """Video streaming route to display VOD detection results."""
    if uploaded_video_path and processed_video_path and detection_log_path:
        return Response(generate_vod_frames(uploaded_video_path, processed_video_path, detection_log_path),
                        mimetype='multipart/x-mixed-replace; boundary=frame')
    else:
        return "No video uploaded yet."

@app.route('/download_processed_video')
def download_processed_video():
    """Download the processed video."""
    if processed_video_path and os.path.exists(processed_video_path):
        return send_file(processed_video_path, as_attachment=True)
    else:
        return "No processed video available for download."

@app.route('/download_detection_log')
def download_detection_log():
    """Download the detection log as a CSV file."""
    if detection_log_path and os.path.exists(detection_log_path):
        return send_file(detection_log_path, as_attachment=True)
    else:
        return "No detection log available for download."
    
@app.route('/get_video_logs', methods=['GET'])
def get_video_logs():
    """Retrieve historical video detection logs from MySQL."""
    try:
        conn = mysql.connector.connect(**db_config_vod)
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT id, timestamp, video_path, csv_path 
        FROM video_logs 
        ORDER BY timestamp DESC
        """
        cursor.execute(query)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Modify paths to be web-accessible
        for log in logs:
            log['video_path'] = log['video_path'].replace('\\', '/')
            log['csv_path'] = log['csv_path'].replace('\\', '/')
        
        return jsonify({'logs': logs})
    except mysql.connector.Error as e:
        print(f"[ERROR] Failed to retrieve video logs: {e}")
        return jsonify({'error': 'Failed to fetch logs'}), 500

@app.route('/vod_past_video_feed/<path:video_path>')
def vod_past_video_feed(video_path):
    """Stream a past processed video."""
    full_video_path = os.path.join(os.getcwd(), video_path)
    if os.path.exists(full_video_path):
        return Response(generate_vod_frames(full_video_path, 
                                            os.path.join(PROCESSED_FOLDER, f"processed_{os.path.basename(video_path)}"),
                                            os.path.join(PROCESSED_FOLDER, f"detection_log_{os.path.basename(video_path).replace('.mp4', '.csv')}")),
                        mimetype='multipart/x-mixed-replace; boundary=frame')
    else:
        return "Video not found", 404

@app.route('/download_past_video/<path:video_path>')
def download_past_video(video_path):
    """Download a past processed video."""
    full_video_path = os.path.join(os.getcwd(), video_path)
    if os.path.exists(full_video_path):
        return send_file(full_video_path, as_attachment=True)
    else:
        return "Video not found", 404

@app.route('/download_past_log/<path:csv_path>')
def download_past_log(csv_path):
    """Download a past detection log."""
    full_csv_path = os.path.join(os.getcwd(), csv_path)
    if os.path.exists(full_csv_path):
        return send_file(full_csv_path, as_attachment=True)
    else:
        return "Detection log not found", 404

if __name__ == '__main__':
    app.run(host=os.getenv('HOST', '0.0.0.0'), port=int(os.getenv('PORT', 5000)), debug=os.getenv('DEBUG', 'False') == 'True')
