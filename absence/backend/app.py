from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configuration de la base de données MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'student_db'

mysql = MySQL(app)

# Configuration du dossier d'images
app.config['UPLOAD_FOLDER'] = 'uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/add_student', methods=['POST'])
def add_student():
    if 'image' not in request.files:
        return jsonify({'error': 'Image not found'}), 400

    # Récupérer les informations envoyées dans le formulaire
    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    class_name = request.form.get('class')

    if not all([first_name, last_name, email, phone, class_name]):
        return jsonify({'error': 'All fields are required!'}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected image!'}), 400

    if not allowed_file(image.filename):
        return jsonify({'error': 'Invalid file type!'}), 400

    filename = secure_filename(image.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(image_path)

    cursor = mysql.connection.cursor()
    try:
        cursor.execute(
            "INSERT INTO students (first_name, last_name, email, phone, class, image_path) VALUES (%s, %s, %s, %s, %s, %s)",
            (first_name, last_name, email, phone, class_name, image_path)
        )
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Student added successfully'})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': 'Failed to add student!'}), 500

if __name__ == '__main__':
    app.run(debug=True)