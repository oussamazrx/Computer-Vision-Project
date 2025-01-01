from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
import os

app = Flask(__name__)

# Configuration de la base de données MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Mekkaoui'
app.config['MYSQL_DB'] = 'student_db'

mysql = MySQL(app)

# Configuration du dossier d'images
app.config['UPLOAD_FOLDER'] = 'uploads/'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/add_student', methods=['POST'])
def add_student():
    if 'image' not in request.files:
        return jsonify({'error': 'Image not found'}), 400
    
    # Récupérer les informations envoyées dans le formulaire
    first_name = request.form['first_name']
    last_name = request.form['last_name']
    email = request.form['email']
    phone = request.form['phone']
    class_name = request.form['class']
    
    image = request.files['image']
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image.filename)
    image.save(image_path)
    
    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO students (first_name, last_name, email, phone, class, image_path) VALUES (%s, %s, %s, %s, %s, %s)",
                   (first_name, last_name, email, phone, class_name, image_path))
    mysql.connection.commit()
    cursor.close()
    
    return jsonify({'message': 'Student added successfully'})

if __name__ == '__main__':
    app.run(debug=True)
