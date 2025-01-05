import React, { useState, useEffect } from 'react';
import AddStudentForm from './AddStudentForm';
import ClassList from './ClassList';
import StudentList from './StudentList';
import './AddStudentForm.css';

function AdminDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch the list of classes from the backend
    fetch('http://localhost:5000/classes')
      .then(response => response.json())
      .then(data => setClasses(data))
      .catch(error => console.error('Error fetching classes:', error));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      // Fetch the list of students for the selected class from the backend
      fetch(`http://localhost:5000/classes/${selectedClass}/students`)
        .then(response => response.json())
        .then(data => setStudents(data))
        .catch(error => console.error('Error fetching students:', error));
    }
  }, [selectedClass]);

  return (
    <div className="AdminDashboard">
      <h1>Admin Dashboard</h1>
      <AddStudentForm />
      <ClassList classes={classes} onSelectClass={setSelectedClass} />
      {selectedClass && <StudentList students={students} />}
    </div>
  );
}

export default AdminDashboard;