# Computer-Vision-Project
The project automates student attendance tracking by recognizing faces through a webcam. When a registered student appears in front of the camera, the system identifies them and records their check-in with a timestamp.

Architecture
Frontend (absence/application/ - React app):

Admin login and dashboard
Student registration with photo upload
Face recognition interface using webcam (react-webcam)
Class and student management pages
Backend (absence/backend/ - Flask API):

Face encoding and matching using the face_recognition library (dlib-based)
MySQL database connection for storing student data and attendance records
REST endpoints for admin auth, student CRUD, and attendance tracking
Key Features
Student Registration – Add students with photos, personal info, and class assignment
Real-time Face Recognition – Captures faces via webcam and matches against known encodings
Automated Check-ins – Records timestamp when a face is recognized
Attendance History – Tracks who checked in and when
Admin Panel – Protected interface for managing students and viewing attendance
How It Works
Admin registers students with their photos (stored in uploads/ folder)
System encodes facial features from student images using OpenCV and face_recognition
At check-in, the webcam captures the student's face
The backend compares it against known face encodings
Upon match → records check-in with name, time, and date in MySQL
Database Schema
classes – stores class names
students – student profiles with foreign key to classes and image path
check_ins – attendance records with timestamps


CREATE DATABASE student_db;

USE student_db;

-- Create the classes table
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create the students table with a foreign key reference to the classes table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    class_id INT NOT NULL,
    image_path VARCHAR(255),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Insert some sample data into the classes table
INSERT INTO classes (name) VALUES ('Class 1'), ('Class 2'), ('Class 3');


