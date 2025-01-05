# Student Absence Tracking System with Computer Vision

This project is a **Student Absence Tracking System** that uses computer vision to automatically detect student presence or absence via a camera. It combines **Flask** for the backend and **React** for the frontend, while leveraging **MediaPipe** for real-time computer vision to analyze student attendance based on camera input. The application includes advanced data collection and analysis to track student attendance efficiently.

## Features:

- **Real-time attendance tracking** using MediaPipe for face detection and recognition to identify student presence.
- **Student management** for adding, updating, and deleting student records.
- **Class management** for organizing students by class, major, year (promo), and assigned professor (coordinator).
- **Advanced data analysis** for generating attendance reports and analyzing trends.

## Database Setup

To set up the database for this project, use the following SQL queries:

```sql
CREATE DATABASE student_db;

USE student_db;

-- Create the majors table
CREATE TABLE majors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create the professors table
CREATE TABLE professors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- Insert some sample data into the professors table
INSERT INTO professors (first_name, last_name, email) VALUES
('Omar', 'El Idrissi', 'omar.elidrissi@university.com'),
('Fatima', 'Benkirane', 'fatima.benkirane@university.com'),
('Rachid', 'El Amrani', 'rachid.elamrani@university.com'),
('Khadija', 'Boudraa', 'khadija.boudraa@university.com');

-- Create the classes table with additional fields: major, promo, and coordinator
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    major_id INT NOT NULL,
    promo INT NOT NULL, -- Year of graduation
    coordinator_id INT NOT NULL, -- Professor in charge of the class
    FOREIGN KEY (major_id) REFERENCES majors(id),
    FOREIGN KEY (coordinator_id) REFERENCES professors(id)
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

-- Insert some sample data into the majors table
INSERT INTO majors (name) VALUES ('BDIOT') , ('Computer Science'), ('Electrical Engineering');

-- Insert some sample data into the classes table
INSERT INTO classes (name, major_id, promo, coordinator_id)
VALUES
    ('computer vision  ', 1, 2025, 1),
    ('Big Data', 2, 2024, 2),
    ('BI', 1, 2023, 3);
```
