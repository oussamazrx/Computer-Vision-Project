from flask import Flask, request, jsonify, session
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pymysql
import cv2
import numpy as np
import face_recognition
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS with support for credentials (cookies)

# Session secret key
app.secret_key = os.urandom(24)

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'student_db'

# Initialize MySQL connection
def get_db_connection():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB'],
        cursorclass=pymysql.cursors.DictCursor
    )

# Configuration for file uploads
app.config['UPLOAD_FOLDER'] = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Path to known faces directory
path = r'C:\Users\mekka\Downloads\test\RL\basicTrading\Computer-Vision-Project\absence\backend\faces'
images = []
classNames = []

# Load known faces and names
personsList = os.listdir(path)
for cl in personsList:
    curPersonn = cv2.imread(f'{path}/{cl}')
    if curPersonn is None:
        print(f"Warning: Could not read image {cl}")
    else:
        images.append(curPersonn)
        classNames.append(os.path.splitext(cl)[0])

# Function to encode faces
def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList

encodeListKnown = findEncodings(images)
print('Encoding Complete.')

# Save check-in to database
def save_check_in(name):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        current_time = datetime.now()
        query = """
        INSERT INTO check_ins (name, timestamp, date) 
        VALUES (%s, %s, %s)
        """
        values = (name, current_time.strftime('%H:%M:%S'), current_time.strftime('%Y-%m-%d'))
        cursor.execute(query, values)
        connection.commit()
        return True
    except Exception as e:
        print(f"Error saving check-in: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

# Get all check-ins
def get_all_check_ins():
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        query = """
        SELECT id, name, DATE_FORMAT(timestamp, '%H:%i:%s') as timestamp, 
        DATE_FORMAT(date, '%Y-%m-%d') as date
        FROM check_ins 
        ORDER BY date DESC, timestamp DESC
        """
        cursor.execute(query)
        check_ins = cursor.fetchall()
        return check_ins
    except Exception as e:
        print(f"Error fetching check-ins: {e}")
        return []
    finally:
        cursor.close()
        connection.close()

# Admin login route
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'admin123':
        session['admin_logged_in'] = True
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# Admin logout route
@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return jsonify({'message': 'Logout successful'})

# Protected route example
@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'message': 'Welcome to the admin dashboard'})

# Add student route
@app.route('/add_student', methods=['POST'])
def add_student():
    if 'image' not in request.files:
        return jsonify({'error': 'Image not found'}), 400

    # Get form data
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    class_id = request.form.get('class_id')

    if not all([first_name, last_name, email, phone, class_id]):
        return jsonify({'error': 'All fields are required!'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected image!'}), 400

    if not allowed_file(image.filename):
        return jsonify({'error': 'Invalid file type!'}), 400

    # Save image
    file_extension = image.filename.rsplit('.', 1)[1].lower()
    new_filename = f"{first_name}_{last_name}.{file_extension}"
    new_filename = secure_filename(new_filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
    image.save(image_path)

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO students (first_name, last_name, email, phone, class_id, image_path) VALUES (%s, %s, %s, %s, %s, %s)",
            (first_name, last_name, email, phone, class_id, image_path)
        )
        connection.commit()
        return jsonify({'message': 'Student added successfully'})
    except Exception as e:
        connection.rollback()
        return jsonify({'error': f'Failed to add student: {str(e)}'}), 500
    finally:
        cursor.close()
        connection.close()

# Get all classes route
@app.route('/classes', methods=['GET'])
def get_classes():
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT id, name FROM classes")
        classes = cursor.fetchall()
        return jsonify(classes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Get students by class ID route
@app.route('/classes/<int:class_id>/students', methods=['GET'])
def get_students(class_id):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT id, first_name, last_name, email, phone, image_path 
            FROM students 
            WHERE class_id = %s
        """, (class_id,))
        students = cursor.fetchall()
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Get all students route
@app.route('/students', methods=['GET'])
def get_all_students():
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT id, first_name, last_name, email, phone, image_path, class_id 
            FROM students
        """)
        students = cursor.fetchall()
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# Face recognition route
@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        img = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
        
        imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
        imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
        
        faceLocations = face_recognition.face_locations(imgS)
        encodeCurrentFrame = face_recognition.face_encodings(imgS, faceLocations)
        
        recognized_faces = []
        
        for encodeFace, faceLoc in zip(encodeCurrentFrame, faceLocations):
            matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
            faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
            matchIndex = np.argmin(faceDis)
            
            if matches[matchIndex] and faceDis[matchIndex] < 0.6:
                name = classNames[matchIndex].upper()
            else:
                name = "UNKNOWN"
            
            # Save to database if person is recognized
            if name != "UNKNOWN":
                save_check_in(name)
            
            recognized_faces.append({
                'name': name,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return jsonify({'recognized_faces': recognized_faces})

    except Exception as e:
        print(f"Error in recognize_face: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Get all check-ins route
@app.route('/api/check-ins', methods=['GET'])
def get_check_ins():
    check_ins = get_all_check_ins()
    return jsonify({'check_ins': check_ins})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)