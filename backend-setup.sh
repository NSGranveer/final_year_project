
#!/bin/bash

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install flask flask-cors flask-mail python-dotenv opencv-python torch ultralytics cvzone mysql-connector-python Werkzeug

echo "Backend dependencies installed successfully!"
echo "Run 'python app_with_cors.py' to start the Flask server."
