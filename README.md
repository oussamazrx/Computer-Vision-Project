﻿# Computer-Vision-Project


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


