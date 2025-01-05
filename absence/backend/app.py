# from flask import Flask, request, jsonify
# from flask_mysqldb import MySQL
# import os
# from werkzeug.utils import secure_filename
# from flask_cors import CORS  # Import CORS

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Configuration de la base de données MySQL
# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = ''
# app.config['MYSQL_DB'] = 'student_db'

# mysql = MySQL(app)

# # Configuration du dossier d'images
# app.config['UPLOAD_FOLDER'] = 'uploads/'
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# if not os.path.exists(app.config['UPLOAD_FOLDER']):
#     os.makedirs(app.config['UPLOAD_FOLDER'])

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# @app.route('/add_student', methods=['POST'])
# def add_student():
#     if 'image' not in request.files:
#         return jsonify({'error': 'Image not found'}), 400

#     # Récupérer les informations envoyées dans le formulaire
#     first_name = request.form.get('first_name')
#     last_name = request.form.get('last_name')
#     email = request.form.get('email')
#     phone = request.form.get('phone')
#     class_name = request.form.get('class')

#     if not all([first_name, last_name, email, phone, class_name]):
#         return jsonify({'error': 'All fields are required!'}), 400

#     image = request.files['image']
#     if image.filename == '':
#         return jsonify({'error': 'No selected image!'}), 400

#     if not allowed_file(image.filename):
#         return jsonify({'error': 'Invalid file type!'}), 400

#     # Generate a custom file name using the first and last name
#     file_extension = image.filename.rsplit('.', 1)[1].lower()
#     new_filename = f"{first_name}_{last_name}.{file_extension}"

#     new_filename = secure_filename(new_filename)
#     image_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
#     image.save(image_path)

#     cursor = mysql.connection.cursor()
#     try:
#         cursor.execute(
#             "INSERT INTO students (first_name, last_name, email, phone, class, image_path) VALUES (%s, %s, %s, %s, %s, %s)",
#             (first_name, last_name, email, phone, class_name, image_path)
#         )
#         mysql.connection.commit()
#         cursor.close()
#         return jsonify({'message': 'Student added successfully'})
#     except Exception as e:
#         mysql.connection.rollback()
#         return jsonify({'error': 'Failed to add student!'}), 500
# @app.route('/classes', methods=['GET'])
# def get_classes():
#     cursor = mysql.connection.cursor()
#     cursor.execute("SELECT id, name FROM classes")
#     classes = cursor.fetchall()
#     cursor.close()
#     return jsonify(classes)

# @app.route('/classes/<int:class_id>/students', methods=['GET'])
# def get_students(class_id):
#     cursor = mysql.connection.cursor()
#     cursor.execute("SELECT id, first_name, last_name FROM students WHERE class_id = %s", (class_id,))
#     students = cursor.fetchall()
#     cursor.close()
#     return jsonify(students)

# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, request, jsonify, session
from flask_mysqldb import MySQL
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS with support for credentials (cookies)

# Session secret key
app.secret_key = os.urandom(24)

# Configuration de la base de données MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'inout'
app.config['MYSQL_DB'] = 'student_db'

mysql = MySQL(app)

# Configuration du dossier d'images
app.config['UPLOAD_FOLDER'] = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Admin login route
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == 'admin123':
        
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


# Route to get all majors
@app.route('/majors', methods=['GET'])
def get_majors():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, name FROM majors")
    majors = cursor.fetchall()
    cursor.close()

    majors_list = [{"id": major_id, "name": major_name} for major_id, major_name in majors]

    return jsonify(majors_list)

# Route to get all professors (for coordinator dropdown)
@app.route('/professors', methods=['GET'])
def get_professors():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM professors")
    professors = cursor.fetchall()
    cursor.close()

    professors_list = [{"id": professor_id, "name": professor_name} for professor_id, professor_name in professors]

    return jsonify(professors_list)


@app.route('/classes', methods=['GET'])
def get_classes():
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT c.id, c.name, m.name AS major, c.promo, CONCAT(p.first_name, ' ', p.last_name) AS coordinator
        FROM classes c
        JOIN majors m ON c.major_id = m.id
        JOIN professors p ON c.coordinator_id = p.id
    """)
    classes = cursor.fetchall()
    cursor.close()

    classes_list = [{
        "id": class_id, 
        "name": class_name, 
        "major": major_name, 
        "promo": promo_year,
        "coordinator": coordinator_name
    } for class_id, class_name, major_name, promo_year, coordinator_name in classes]

    return jsonify(classes_list)

# Route to add a new class
@app.route('/add_class', methods=['POST'])
def add_class():
    # Get form data
    class_name = request.form.get('name')
    major_id = request.form.get('major_id')
    promo = request.form.get('promo')
    coordinator_id = request.form.get('coordinator_id')

    if not all([class_name, major_id, promo, coordinator_id]):
        return jsonify({'error': 'All fields are required!'}), 400

    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO classes (name, major_id, promo, coordinator_id) VALUES (%s, %s, %s, %s)",
            (class_name, major_id, promo, coordinator_id)
        )
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': f'Class "{class_name}" added successfully'}), 201
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': 'Failed to add class!', 'details': str(e)}), 500


@app.route('/add_student', methods=['POST'])
def add_student():
    # if not session.get('admin_logged_in'):
    #     return jsonify({'error': 'Unauthorized'}), 401

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

    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO students (first_name, last_name, email, phone, class_id, image_path) VALUES (%s, %s, %s, %s, %s, %s)",
            (first_name, last_name, email, phone, class_id, image_path)
        )
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Student added successfully'})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': 'Failed to add student!'}), 500


@app.route('/classes/<int:class_id>/students', methods=['GET'])
def get_students(class_id):
    cursor = mysql.connection.cursor()
    try:
        # Modified query to get all student details
        cursor.execute("""
            SELECT id, first_name, last_name, email, phone, image_path 
            FROM students 
            WHERE class_id = %s
        """, (class_id,))
        students = cursor.fetchall()
        
        # Convert to list of dictionaries with all fields
        students_list = []
        for student in students:
            students_list.append({
                "id": student[0],
                "first_name": student[1],
                "last_name": student[2],
                "email": student[3],
                "phone": student[4],
                "image_path": student[5]
            })
        
        return jsonify(students_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()



@app.route('/students', methods=['GET'])
def get_all_students():
    cursor = mysql.connection.cursor()
    try:
        # Fetch all students
        cursor.execute("""
            SELECT id, first_name, last_name, email, phone, image_path, class_id 
            FROM students
        """)
        students = cursor.fetchall()
        
        # Convert to list of dictionaries
        students_list = []
        for student in students:
            students_list.append({
                "id": student[0],
                "first_name": student[1],
                "last_name": student[2],
                "email": student[3],
                "phone": student[4],
                "image_path": student[5],
                "class_id": student[6]  # Include class_id for reference
            })
        
        return jsonify(students_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)
